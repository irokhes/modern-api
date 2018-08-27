'use strict';

const hapi = require('hapi');
const mongoose = require('mongoose');
const Painting = require('./models/Painting');

const server = hapi.Server({
    port: process.env.PORT || 4000,
    host: 'localhost'
})

const init = async () => {
    await server.start();
    mongoose.connect('mongodb://localhost:27017/modernapi');
    mongoose.connection.once('open', () => {
        console.log('connected to database');
    })
    server.route([
        {
            method: 'GET',
            path: '/',
            handler: (request, reply) => {
                return `<h1>My modern hapi API</h1>`
            }
        },
        {
            method: 'GET',
            path: '/api/v1/paintings',
            handler: (request, reply) => {
                return Painting.find();
            }
        },
        {
            method: 'POST',
            path: '/api/v1/paintings',
            handler: (request, reply) => {
                const { name, url, techniques } = request.payload;
                const painting = new Painting({
                    name, url, techniques
                });
                return painting.save();
            }
        }
    ])
    console.log(`Server running at ${server.info.uri}`);
}

init();
