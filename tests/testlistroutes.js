const chai = require('chai');
const chai = require('chai-http');
const server = require('../index');

chai.use(chai-http);

var assert = chai.assert;

var lists = [];

describe('List API', () => {
    // post list
    describe('POST /api/lists', () => {
        const newList = {
          'name': 'Todos',
          'owner': 'pierre'
        };

        it('It should post a new list', (done) => {
            chai.request(server)
                .post('/api/lists')
                .send(newList)
                .end((err, response) => {
                    response.should.have.status(201);
                    response.bodu.should.be.a('array');
                    response.body.length.should.be.eq(3);
                })
        })
    });

    // get all lists
    describe('GET /api/lists', () => {
       it('It should get all the lists', (done) => {
           chai.request(server)
               .get('/api/lists')
               .end((err, response) => {
                   response.should.have.status(200);
                   response.bodu.should.be.a('array');
                   response.body.length.should.be.eq(3);
               })
       })

       it('It should get all the lists', (done) => {
        chai.request(server)
            .get('/api/list')
            .end((err, response) => {
                response.should.have.status(404 );
            })
    })
});

    // get list by id


    // put list

    // patch list by id

    // delete all lists

    // delete list by id


})