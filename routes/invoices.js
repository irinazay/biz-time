const  express = require("express");
const router = express.Router();
const db = require("../db")
const ExpressError = require("../expressError")

router.get ('/', async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT id, comp_code FROM invoices`);
        return res.json({invoices: result.rows})
      } catch (err) {
        return next(err)
    }
})


router.get ('/:id', async (req,res, next) => {
    try {

        const {id} = req.params;

        const invoiceResult = await db.query(
            `SELECT  id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE id=$1`, [id]);
        if (invoiceResult.rows.length === 0) {
            throw new ExpressError("Code not found", 404)
        }
        
        const code =  invoiceResult.rows[0].comp_code;

        const companyResult = await db.query(
            `SELECT code, name, description FROM companies WHERE code=$1`, [code]);
        
    const invoice = {
      id: invoiceResult.rows[0].id,
      amt: invoiceResult.rows[0].amt,
      paid: invoiceResult.rows[0].paid,
      add_date: invoiceResult.rows[0].add_date,
      paid_date: invoiceResult.rows[0].paid_date,
      company: {
        code: invoiceResult.rows[0].comp_code,
        name: companyResult.rows[0].name,
        description: companyResult.rows[0].description,
      }
    };
        return res.json({"invoice": invoice})
      } catch (err) {
        return next(err)
    }
    
})


router.post ('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body; 

        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt) 
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
          [comp_code, amt]
    );
  
      return res.json({invoices: result.rows[0]});
      } catch (err) {
        return next(err)
    }
})


router.put ('/:id', async (req,res, next) => {
    try {
        const {id} = req.params;
        const {amt} = req.body; 
        const result = await db.query(
              `UPDATE invoices SET amt=$1
               WHERE id = $2
               RETURNING  id, comp_code, amt, paid, add_date, paid_date`,
            [ amt, id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError("Code not found", 404)
        }
    
        return res.json(result.rows[0]);
      } catch (err) {
        return next(err)
    }
})

router.delete ('/:id', async (req,res, next) => {
    try {
        let id = req.params.id;
    
        const result = await db.query(
              `DELETE FROM invoices
               WHERE id = $1
               RETURNING id`,
            [id]);
    
        if (result.rows.length === 0) {
          throw new ExpressError(`No such invoice: ${id}`, 404);
        }
    
        return res.json({"status": "deleted"});
      }
    
      catch (err) {
        return next(err);
      }

})

module.exports = router;