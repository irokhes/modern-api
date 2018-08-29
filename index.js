'use strict';

const hapi = require('hapi');
const mongoose = require('mongoose');
const Painting = require('./models/Painting');
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');
const schema = require('./graphql/schema');

/* swagger section */
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const server = hapi.Server({
    port: process.env.PORT || 4000,
    host: 'localhost'
})

mongoose.connect('mongodb://localhost:27017/modernapi');
mongoose.connection.once('open', () => {
    console.log('connected to database');
})

const init = async () => {
	await server.register([
		Inert,
		Vision,
		{
			plugin: HapiSwagger,
			options: {
				info: {
					title: 'Paintings API Documentation',
					version: Pack.version
				}
			}
		}
    ]);
    
    await server.register({
        plugin: graphiqlHapi,
        options: {
            path: '/graphiql',
            graphiqlOptions: {
                endpointURL: '/graphql'
            },
            route: {
                cors: true
            }
        }
    });

    await server.register({
        plugin: graphqlHapi,
        options: {
            path: '/graphql',
            graphqlOptions: {
                schema
            },
            route: {
                cors: true
            }
        }
    });

    server.route([
        {
            method: 'GET',
            path: '/api/v1/paintings',
            config: {
				description: 'Get all the paintings',
				tags: ['api', 'v1', 'painting']
			},
            handler: (request, reply) => {
                return Painting.find();
            }
        },
        {
            method: 'POST',
            path: '/api/v1/paintings',
			config: {
				description: 'Save a new paiting.',
				tags: ['api', 'v1', 'painting']
			},
            handler: (request, reply) => {
                const { name, url, techniques } = request.payload;
                const painting = new Painting({
                    name, url, techniques
                });
                return painting.save();
            }
        }
    ]);

    await server.start();

    console.log(`Server running at ${server.info.uri}`);
}

init();
