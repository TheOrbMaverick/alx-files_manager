const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Assuming the Express app is exported from app.js

chai.use(chaiHttp);
const { expect } = chai;

describe('GET /status', () => {
  it('should return the status of Redis and DB', (done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('redis', true);
        expect(res.body).to.have.property('db', true);
        done();
      });
  });

  it('should handle errors gracefully', (done) => {
    // Simulate Redis or DB error scenario
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property('error');
        done();
      });
  });
});

describe('POST /users', () => {
  it('should create a new user with valid email and password', (done) => {
    chai.request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('email', 'test@example.com');
        done();
      });
  });

  it('should return 400 for missing email', (done) => {
    chai.request(app)
      .post('/users')
      .send({ password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Missing email');
        done();
      });
  });

  it('should return 400 for missing password', (done) => {
    chai.request(app)
      .post('/users')
      .send({ email: 'test@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Missing password');
        done();
      });
  });

  it('should return 400 for already existing user', (done) => {
    chai.request(app)
      .post('/users')
      .send({ email: 'existing@example.com', password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Already exist');
        done();
      });
  });
});

describe('POST /users', () => {
  it('should create a new user with valid email and password', (done) => {
    chai.request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('email', 'test@example.com');
        done();
      });
  });

  it('should return 400 for missing email', (done) => {
    chai.request(app)
      .post('/users')
      .send({ password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Missing email');
        done();
      });
  });

  it('should return 400 for missing password', (done) => {
    chai.request(app)
      .post('/users')
      .send({ email: 'test@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Missing password');
        done();
      });
  });

  it('should return 400 for already existing user', (done) => {
    chai.request(app)
      .post('/users')
      .send({ email: 'existing@example.com', password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Already exist');
        done();
      });
  });
});

describe('GET /stats', () => {
  it('should return the number of users and files', (done) => {
    chai.request(app)
      .get('/stats')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('users').that.is.a('number');
        expect(res.body).to.have.property('files').that.is.a('number');
        done();
      });
  });
});

describe('GET /connect', () => {
  it('should authenticate user and return a token', (done) => {
    const auth = 'Basic ' + Buffer.from('test@example.com:password123').toString('base64');
    chai.request(app)
      .get('/connect')
      .set('Authorization', auth)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });

  it('should return 401 for invalid credentials', (done) => {
    const auth = 'Basic ' + Buffer.from('wrong@example.com:wrongpassword').toString('base64');
    chai.request(app)
      .get('/connect')
      .set('Authorization', auth)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('error', 'Unauthorized');
        done();
      });
  });
});

describe('GET /disconnect', () => {
  it('should disconnect the user and return 204', (done) => {
    chai.request(app)
      .get('/disconnect')
      .set('X-Token', 'valid-token')
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  it('should return 401 for invalid token', (done) => {
    chai.request(app)
      .get('/disconnect')
      .set('X-Token', 'invalid-token')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('error', 'Unauthorized');
        done();
      });
  });
});

describe('GET /users/me', () => {
  it('should return user info for valid token', (done) => {
    chai.request(app)
      .get('/users/me')
      .set('X-Token', 'valid-token')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('email');
        done();
      });
  });

  it('should return 401 for missing or invalid token', (done) => {
    chai.request(app)
      .get('/users/me')
      .set('X-Token', 'invalid-token')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('error', 'Unauthorized');
        done();
      });
  });
});

describe('POST /files', () => {
  it('should create a new file and return its data', (done) => {
    chai.request(app)
      .post('/files')
      .set('X-Token', 'valid-token')
      .send({ name: 'testfile.txt', type: 'file', data: 'SGVsbG8gd29ybGQ=' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
        done();
      });
  });
});

describe('GET /files/:id', () => {
  it('should retrieve the correct file based on ID', (done) => {
    chai.request(app)
      .get('/files/valid-file-id')
      .set('X-Token', 'valid-token')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        done();
      });
  });

  it('should return 404 for a non-existent file', (done) => {
    chai.request(app)
      .get('/files/nonexistent-file-id')
      .set('X-Token', 'valid-token')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('error', 'Not found');
        done();
      });
  });
});

describe('GET /files', () => {
  it('should return a list of files with pagination', (done) => {
    chai.request(app)
      .get('/files?page=0')
      .set('X-Token', 'valid-token')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});

describe('PUT /files/:id/publish', () => {
  it('should publish a file and return the updated data', (done) => {
    chai.request(app)
      .put('/files/valid-file-id/publish')
      .set('X-Token', 'valid-token')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('isPublic', true);
        done();
      });
  });
});

describe('PUT /files/:id/unpublish', () => {
  it('should unpublish a file and return the updated data', (done) => {
    chai.request(app)
      .put('/files/valid-file-id/unpublish')
      .set('X-Token', 'valid-token')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('isPublic', false);
        done();
      });
  });
});

describe('GET /files/:id/data', () => {
  it('should return the content of the file', (done) => {
    chai.request(app)
      .get('/files/valid-file-id/data')
      .set('X-Token', 'valid-token')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.type).to.match(/text|application/); // Checking for MIME-type
        done();
      });
  });

  it('should return 404 for a non-existent file', (done) => {
    chai.request(app)
      .get('/files/nonexistent-file-id/data')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('error', 'Not found');
        done();
      });
  });
});
