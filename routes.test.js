process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("./app");
const db = require("./db")

let testCompanies;
let testIndustries;

beforeEach(async function() {

  let resultCompanies = await db.query(`
    INSERT INTO
      companies (code, name, description) VALUES ('testcodecompany', 'Test Company', 'This is test description')
      RETURNING code, name, description`);
  testCompanies = resultCompanies.rows[0];

  let resultIndustries = await db.query(`
  INSERT INTO
    industries (code, industry) VALUES ('testcodeindustry', 'Test Industry')
    RETURNING code, industry`);
  testCompanies = resultIndustries.rows[0];

  let resultIndustriesCompanies = await db.query(`
  INSERT INTO
    industries_companies (industry_code, company_code) VALUES ('testcodeindustry', 'testcodecompany')`);
});


afterEach(async function() {
  // delete any data created by test
  await db.query("DELETE FROM industries_companies");
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM industries");
});

afterAll(async function() {
  // close db connection
  await db.end();
});


describe("GET /companies", function () {
  test("Gets a list of companies", async function () {
    const response = await request(app).get(`/companies`);
    const { companies } = response.body;
    expect(response.statusCode).toBe(200);
    expect(companies).toHaveLength(1);
  });
});


describe("GET /companies/:code",  function () {
  test("Gets a single item", async function () {
    code = 'testcodecompany';
    const response = await request(app).get(`/companies/${code}`);
    expect(response.statusCode).toBe(200);
  
  });

  test("Cannot find item",  async function () {
    const response = await request(app).get(`/companies/sjsj`);
    expect(response.statusCode).toBe(404);
  });
});


describe("POST /companies",  function () {
  test("Creates a new company", async function () {
    const response = await request(app)
      .post(`/companies`)
      .send({
        "name": "Urbun",
        "description": "Apparel company"
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      {
        "code": "urbun",
        "name": "Urbun",
        "description": "Apparel company"
    }
    );
  });
});


describe("PUT /companies/:code", function () {
  test("Updates a company", async function () {
    code = 'testcodecompany';
    const response = await request(app)
      .put(`/companies/${code}`)
      .send({
        name: "Testtesttest",
        description: "Description"
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
        {
            "name": "Testtesttest",
            "description": "Description"
        }
    );
    
  });

  test("Can't find company", async function () {
    const response = await request(app).put(`/companies/djdj`);
    expect(response.statusCode).toBe(404);
  });
});

// describe("DELETE /companies/:code", function () {
//   test("Deletes a single a company", async function () {
//     code = 'testcodecompany';
//     const response = await request(app)
//       .delete(`/companies/${code}`);
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toEqual({ message: "Deleted" });
//   });
// });