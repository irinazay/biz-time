const  express = require("express");
const router = new express.Router();
const slugify = require("slugify");
const { resourceLimits } = require("worker_threads");
const db = require("../db")
const ExpressError = require("../expressError")


router.get ('/', async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT c.code, c.name, i.industry 
            FROM companies AS c
            LEFT JOIN industries_companies AS ic
            ON c.code = ic.company_code
            LEFT JOIN industries AS i
            On ic.industry_code = i.code`);
            
            const data = new Map();
    
            for (let i = 0; i < result.rows.length; i++) {
                let code = result.rows[i].code;
                let industry = result.rows[i].industry;
          
                if (data.has(code)) data.get(code).push(industry);
                else data.set(code, [industry]); 

            }
            
            const obj = [];
            for (let [key, value] of data) {
                let company = {};
                company[key] = value;
                obj.push(company)

            }
               
        return res.send({companies: obj})

      } catch (err) {
        return next(err)
    }
})


router.get ('/:code', async (req,res, next) => {
    try {

        const {code} = req.params;
        const result = await db.query(
            `SELECT code, name FROM companies WHERE code=$1`, [code]);
        if (result.rows.length === 0) {
            throw new ExpressError("Code not found", 404)
        }
        return res.json({company: result.rows})
      } catch (err) {
        return next(err)
    }
    
})


router.post ('/', async (req, res, next) => {
    try {
        const {name, description } = req.body; 
        let code = slugify(name, {lower: true});

        const result = await db.query(
            `INSERT INTO companies (code, name, description) 
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
          [code, name, description]
    );
  
      return res.status(201).json(result.rows[0]);
      } catch (err) {
        return next(err)
    }
})


router.put ('/:code', async (req,res, next) => {
    try {
        const { name, description } = req.body;
        
        const result = await db.query(
              `UPDATE companies SET name=$1, description=$2
               WHERE code = $3
               RETURNING  name, description`,
            [ name, description, req.params.code]
        );

        if (result.rows.length === 0) {
            throw new ExpressError("Code not found", 404)
        }
    
        return res.json(result.rows[0]);
      } catch (err) {
        return next(err)
    }
})

router.delete ('/:code', async (req,res, next) => {
    try {
        const result = await db.query(
            "DELETE FROM companies WHERE code = $1 RETURNING code",
            [req.params.code]
        );
        if (result.rows.length === 0) {
            throw new ExpressError("Code not found", 404)
        }

        return res.json({message: "Deleted"});

      } catch (err) {
        return next(err)
    }
})

module.exports = router;