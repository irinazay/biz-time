const  express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")


router.get ('/', async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT code, name FROM companies`);
        return res.json({companies: result.rows})
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
        const { code, name, description } = req.body; 

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