DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

CREATE TABLE companies
(
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    num_employees INT,
    description TEXT,
    logo_url TEXT
);

CREATE TABLE jobs
(
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary FLOAT NOT NULL,
    equity FLOAT CHECK (equity <=1),
    company_handle TEXT REFERENCES companies (handle) ON DELETE CASCADE,
    date_posted DATE DEFAULT CURRENT_DATE
);

CREATE TABLE users
(
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO users
    (username, password, first_name, last_name, email, photo_url)
VALUES
    ('user1', 'abc123', 'Jim', 'Henson', 'jim@jim.com', 'http://photo.com/6548961881685');

INSERT INTO users
    (username, password, first_name, last_name, email, photo_url)
VALUES
    ('user2', 'abc123', 'John', 'Henson', 'john@jim.com', 'http://photo.com/6548961881685');

INSERT INTO users
    (username, password, first_name, last_name, email, photo_url, is_admin)
VALUES
    ('user3', 'abc123', 'Bob', 'Henson', 'bob@jim.com', 'http://photo.com/6548961881685', true);

INSERT INTO companies
    (handle, name, num_employees, description,logo_url)
VALUES
    ('ibm', 'IBM', 25000, 'Computer Hardware and Software Engineering', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/800px-IBM_logo.svg.png');

INSERT INTO companies
    (handle, name, num_employees, description,logo_url)
VALUES
    ('bet', 'Bethesda Game Studios', 2000, 'Video Game Developing', 'https://i.pinimg.com/originals/a9/13/78/a91378259d85d1016bf16a7d295f1167.png');

INSERT INTO companies
    (handle, name, num_employees, description,logo_url)
VALUES
    ('koi', 'Koi Mods', 1, 'Video Game Mod Hosting', 'https://i.pinimg.com/originals/cc/5f/62/cc5f62b925b6de4fc98329acd8676463.png');

INSERT INTO jobs
(title, salary, equity, company_handle)
VALUES
('Computer Hardware Engineer', 100000, .05, 'ibm');

INSERT INTO jobs
(title, salary, equity, company_handle)
VALUES
('Software Development Engineer', 59000, 0.01, 'ibm');

INSERT INTO jobs
(title, salary, equity, company_handle)
VALUES
('3D Graphics Artist', 65000, 0.05, 'bet');

INSERT INTO jobs
(title, salary, equity, company_handle)
VALUES
('Game Engine Engineer', 75000, 0.05, 'bet');

INSERT INTO jobs
(title, salary, equity, company_handle)
VALUES
('Database Engineer', 0, 0, 'koi');