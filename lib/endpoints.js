const log = require('debug-level')('jaxom:eps');

const cfg = require('./config').get();
const fs = require('fs');
const path = require('path');
const util = require('util');
const validator = require('validator');

const exists = util.promisify(fs.exists);
readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

var epPath = path.join(cfg.datapath,'endpoints.json');
var statPath = path.join(cfg.datapath,'status.json');

const helpers = {
    create: async function(filepath){
        const ex = await exists(filepath);
        if (!ex) {
            log.debug('creating %s', filepath);
            await writeFile(filepath, '[]', 'utf-8');
        }
    },
    createAll: function(){
        return Promise.all([
            helpers.create(epPath),
            helpers.create(statPath)
        ])
    },
    loadEndpoints: async function(){
        const epDat = await readFile(epPath);
        return JSON.parse(epDat);
    },
    loadFilteredEndpoints: async function(){
        var all = await helpers.loadEndpoints();
        if (cfg.env) all = all.filter(elem => {return elem.env.toLowerCase() == cfg.env.toLowerCase()})
        if (cfg.domain) all = all.filter(elem => {return elem.domain.toLowerCase() == cfg.domain.toLowerCase()})
        if (cfg.seq) all = all.filter(elem => {return elem.seq == cfg.seq})
        if (cfg.active) all = all.filter(elem => {return elem.active == cfg.active})
        if (cfg.seqorder){
            all.sort((a,b) => a.seq-b.seq)
        }
        else {
            all.sort((a,b) => {
                if (a.env != b.env) return require('../lib/jutil').strcmp(a.env,b.env)
                else if (a.domain != b.domain) return require('../lib/jutil').strcmp(a.domain,b.domain)
                else return require('../lib/jutil').strcmp(a.name,b.name)
            })     
        }
        return all
    },
    saveEndpoints: async function(eps){
        await writeFile(epPath,JSON.stringify(eps),'utf-8');
    },
    saveFilteredEndpoints: async function(eps){
        var all = await helpers.loadEndpoints();
        all.forEach(ep => {
            var newep = eps.find(elem => elem.seq == ep.seq);
            if (newep){
                Object.assign(ep,newep)
            }
        })
        log.debug(all);
        await helpers.saveEndpoints(all);
    }
}

module.exports = {
    activate: async function(){
        var all = await helpers.loadFilteredEndpoints();
        log.debug('activating %d',all.length);
        all.forEach(ep => {ep.active = true})
        await helpers.saveFilteredEndpoints(all);
        return all.length
    },
    addEndpoint: async function(ep){
        var all = await helpers.loadEndpoints();
        log.debug('adding endpoint to collection of %d',all.length);
        all.push(ep);
        await helpers.saveEndpoints(all);
    },
    deactivate: async function(){
        var all = await helpers.loadFilteredEndpoints();
        log.debug('deactivating %d',all.length);
        all.forEach(ep => {ep.active = false})
        await helpers.saveFilteredEndpoints(all);
        return all.length
    },
    deleteEndpoint: async function(seq){
        log.debug('deleting for %d',seq);
        var all = await helpers.loadEndpoints();
        var tmp = all.filter(elem => {return elem.seq != seq});
        await helpers.saveEndpoints(tmp);
    },
    getTemplate: async function(){
        var all = await helpers.loadEndpoints();
        var ret = all.find(elem => {return elem.seq == cfg.seq})
        if (!ret) ret = cfg.defaults.endpoint;
        return ret;
    },
    loadEndpoints: async function(){
        await helpers.createAll();
        return helpers.loadEndpoints()
    },
    loadFilteredEndpoints: async function(){
        await helpers.createAll();
        return await helpers.loadFilteredEndpoints()
    },
    nextSeq: function(eps){
        var next = 0;
        eps.forEach(ep => {
            if (ep.seq > next) next = ep.seq
        })
        next++;
        return next;
    },
    updateEndpoint: async function(ep){
        await helpers.saveFilteredEndpoints([ep])
    },
    validate: function(ep){
        return require('./validators/endpointValidator')(ep)
    }
}