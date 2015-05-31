(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.molecules = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
  smiles.js

  Description : parse SMILES chemical line notation
  Imports     : periodic_table
  Exports     : grammar, tokenize, decode

*/

/*
  Imports
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var _referenceElements = require('./../reference/elements');

var _referenceElements2 = _interopRequireDefault(_referenceElements);

/*
  Variable    : grammar
  Description : regular expressions for SMILES grammar

  Fields
    type : token category
    term : SMILES symbol
    tag  : SMILES definition
    expression : regular expression
*/

var grammar = [{ type: 'atom', term: 'H', tag: 'H', expression: /(?=[A-Z])H(?=[^efgos]|$)([0-9]?)+/g }, { type: 'atom', term: 'He', tag: 'He', expression: /He/g }, { type: 'atom', term: 'Li', tag: 'Li', expression: /Li/g }, { type: 'atom', term: 'Be', tag: 'Be', expression: /Be/g }, { type: 'atom', term: 'B', tag: 'B', expression: /B(?=[^aehikr]|$)/g }, { type: 'atom', term: 'C', tag: 'C', expression: /C(?=[^adeflmnorsu]|$)/g }, { type: 'atom', term: 'N', tag: 'N', expression: /N(?=[^abdeiop]|$)/g }, { type: 'atom', term: 'O', tag: 'O', expression: /O(?=[^s]|$)/g }, { type: 'atom', term: 'F', tag: 'F', expression: /F(?=[^elmr]|$)/g }, { type: 'atom', term: 'Ne', tag: 'Ne', expression: /Ne/g }, { type: 'atom', term: 'Na', tag: 'Na', expression: /Na/g }, { type: 'atom', term: 'Mg', tag: 'Mg', expression: /Mg/g }, { type: 'atom', term: 'Al', tag: 'Al', expression: /Al/g }, { type: 'atom', term: 'Si', tag: 'Si', expression: /Si/g }, { type: 'atom', term: 'P', tag: 'P', expression: /P(?=[^abdmortu]|$)/g }, { type: 'atom', term: 'S', tag: 'S', expression: /S(?=[^bcegimnr]|$)/g }, { type: 'atom', term: 'Cl', tag: 'Cl', expression: /Cl/g }, { type: 'atom', term: 'Ar', tag: 'Ar', expression: /Ar/g }, { type: 'atom', term: 'As', tag: 'As', expression: /As/g }, { type: 'atom', term: 'Se', tag: 'Se', expression: /Se/g }, { type: 'atom', term: 'Br', tag: 'Br', expression: /Br/g }, { type: 'atom', term: 'I', tag: 'I', expression: /I(?=[^nr]|$)/g }, { type: 'atom', term: '*', tag: '*', expression: /[*]/g }, { type: 'atom', term: 'b', tag: 'B', expression: /b(?=[^e]|$)/g }, { type: 'atom', term: 'c', tag: 'C', expression: /c(?=[^l]|$)/g }, { type: 'atom', term: 'n', tag: 'N', expression: /n(?=[^ae]|$)/g }, { type: 'atom', term: 'o', tag: 'O', expression: /o(?=[^s]|$)/g }, { type: 'atom', term: 'p', tag: 'P', expression: /p/g }, { type: 'atom', term: 's', tag: 'S', expression: /s(?=[^ei]|$)/g }, { type: 'atom', term: 'se', tag: 'Se', expression: /se/g }, { type: 'bond', term: '-', tag: 'single', expression: /(?=([^0-9]))[-](?=[^0-9-\]])/g }, { type: 'bond', term: '=', tag: 'double', expression: /[=]/g }, { type: 'bond', term: '#', tag: 'triple', expression: /[#]/g }, { type: 'bond', term: '(', tag: 'branch', expression: /[(]/g }, { type: 'bond', term: ')', tag: 'branch', expression: /[)]/g }, { type: 'bond', term: '%', tag: 'ring', expression: /(?=[^+-])(?:[a-zA-Z]{1,2}[@]{1,2})?(?:[a-zA-Z]|[a-zA-Z]*.?[\]])[%]?\d+(?=([^+]|$))/g }, { type: 'bond', term: '.', tag: 'dot', expression: /(?:[A-Z][+-]?[\[])?[.]/g }, { type: 'property', term: '+', tag: 'charge', expression: /[a-zA-Z]{1,2}[0-9]*[+]+[0-9]*(?=[\]])/g }, { type: 'property', term: '-', tag: 'charge', expression: /[a-zA-Z]{1,2}[0-9]*[-]+[0-9]*(?=[\]])/g }, { type: 'property', term: 'n', tag: 'isotope', expression: /(?:[\[])[0-9]+[A-Z]{1,2}(?=.?[^\[]*[\]])/g }, { type: 'property', term: '@', tag: 'chiral', expression: /[A-Z][a-z]?[@](?![A-Z]{2}[0-9]+|[@])/g }, { type: 'property', term: '@@', tag: 'chiral', expression: /[A-Z][a-z]?[@]{2}(?![A-Z]{2}[0-9]+)/g }];

/*
  Function    : tokenize
  Description : parse input string with SMILES grammar

  Syntax
    { tokens } = tokenize(input)

  Arguments
    input : SMILES encoded string

  Output
    { tokens } : array of token objects

  Examples
    { tokens123 } = tokenize('CC(=O)CC')
    { tokensABC } = tokenize('c1cccc1')
*/

function tokenize(input) {
    var tokens = arguments[1] === undefined ? [] : arguments[1];

    // Parse input with SMILES grammar
    for (var i = 0; i < grammar.length; i++) {

        var token = grammar[i];
        var text = [];

        // Check input for match
        while (text = token.expression.exec(input)) {

            // Update tokens
            tokens.push({
                index: text.index,
                type: token.type,
                term: text[0],
                tag: token.tag
            });
        }
    }

    // Sort tokens by index
    tokens.sort(function (a, b) {
        if (a.index < b.index) {
            return -1;
        }
        if (a.index > b.index) {
            return +1;
        }
        return 0;
    });

    // Clean tokens
    for (var i = 0; i < tokens.length; i++) {

        // Extract token values
        var _tokens$i = tokens[i];
        var term = _tokens$i.term;
        var tag = _tokens$i.tag;

        // Check for multi-digit ring number
        if (tag === 'ring') {

            // Extract ring number
            var id = tokens[i].term.match(/[0-9]+/g);

            if (id !== null) {
                id = id[0];
            } else {
                continue;
            }

            if (id.length > 1) {

                var exception = 0;

                // Check for matching ring number
                for (var j = 0; j < tokens.length; j++) {

                    if (i === j || tokens[j].tag !== 'ring') {
                        continue;
                    }

                    // Extract ring number
                    var id2 = tokens[j].term.match(/[0-9]+/g);

                    if (id2 !== null) {
                        id2 = id2[0];
                    } else {
                        continue;
                    }

                    // Compare ring numbers
                    if (id === id2) {
                        exception = 1;
                        break;
                    }
                }

                // Match found
                if (exception === 1) {
                    continue;
                }

                // Token information
                var prefix = tokens[i].term.match(/[a-zA-Z]/g)[0],
                    index = tokens[i].index,
                    type = tokens[i].type,
                    _tag = tokens[i].tag;

                // Parse ring number
                for (var j = 0; j < id.length; j++) {

                    // Create new token
                    tokens.splice(i + 1, 0, {
                        index: index + j,
                        type: type,
                        term: prefix + id.substr(j, j + 1),
                        tag: _tag
                    });
                }

                // Remove original token
                tokens.splice(i, 1);
            }
        }
    }

    return { tokens: tokens };
}

/*
  Function    : decode
  Description : convert SMILES tokens into atoms (nodes) and bonds (edges)

  Syntax
    { atoms, bonds } = decode(tokens)

  Arguments
    tokens : array of tokens obtained from the output of 'tokenize'

  Output
    { atoms, bonds} : array of atom/bonds describing connectivity and properties

  Examples
    { atomsABC, bondsABC } = decode(mytokensABC)
    { atoms123, bonds123 } = decode(tokens123)
*/

function decode(tokens) {

    function validateTokens(tokens) {

        // Check input type
        if (typeof tokens !== 'object') {
            console.log('Error: Tokens must be of type "object"');
            return false;
        } else if (tokens.tokens !== undefined) {
            tokens = tokens.tokens;
        }

        // Check tokens for required fields
        var fields = ['index', 'type', 'term', 'tag'];

        for (var i = 0; i < tokens.length; i++) {

            // Compare fields
            var match = compare(fields, Object.keys(tokens[i]));

            // Check for invalid token
            if (match.reduce(function (a, b) {
                return a + b;
            }) < 4) {
                console.log('Error: Invalid token at index "' + i + '"');
                return false;
            }
        }

        return tokens;
    }

    function readTokens(tokens) {
        var atoms = arguments[1] === undefined ? {} : arguments[1];
        var bonds = arguments[2] === undefined ? {} : arguments[2];
        var properties = arguments[3] === undefined ? {} : arguments[3];
        var keys = arguments[4] === undefined ? {} : arguments[4];

        var newKey = function newKey(x) {
            return x.toString();
        };

        // Parse tokens by category
        for (var i = 0; i < tokens.length; i++) {

            // Extract token values
            var _tokens$i2 = tokens[i];
            var type = _tokens$i2.type;
            var term = _tokens$i2.term;
            var tag = _tokens$i2.tag;
            var index = _tokens$i2.index;
            var key = newKey(index);

            // Categorize tokens
            switch (type) {

                case 'atom':
                    atoms[key] = addAtom(key, tag, term);
                    break;

                case 'bond':
                    bonds[key] = addBond(key, tag, term);
                    break;

                case 'property':
                    properties[key] = { id: key, name: tag, value: term };
                    break;
            }
        }

        // Check number of atoms
        if (atoms.length < 1) {
            console.log('Error: Could not find atoms');
            return false;
        }

        // Extract token keys
        keys.all = [];

        for (var i = 0; i < tokens.length; i++) {
            keys.all[i] = newKey(tokens[i].index);
        }

        // Extract token keys by category
        keys.atoms = Object.keys(atoms);
        keys.bonds = Object.keys(bonds);
        keys.properties = Object.keys(properties);

        return [atoms, bonds, properties, keys];
    }

    function defaultAtoms(atoms, keys) {

        for (var i = 0; i < keys.atoms.length; i++) {

            var _atomID = keys.atoms[i];

            // Check element
            if (_referenceElements2['default'][atoms[_atomID].name] === undefined) {
                continue;
            }

            // Element information
            var element = _referenceElements2['default'][atoms[_atomID].name];

            // Element properties
            atoms[_atomID].group = element.group;
            atoms[_atomID].protons = element.protons;
            atoms[_atomID].neutrons = element.neutrons;
            atoms[_atomID].electrons = element.electrons;

            // Bond properties
            atoms[_atomID].bonds = {
                electrons: 0,
                atoms: []
            };

            // Other properties
            atoms[_atomID].properties = {
                chiral: 0,
                charge: 0,
                aromatic: 0
            };

            // Check aromatic
            if (atoms[_atomID].value === atoms[_atomID].value.toLowerCase()) {
                atoms[_atomID].properties.aromatic = 1;
            }
        }

        return atoms;
    }

    function customAtoms(atoms, properties, keys) {

        for (var i = 0; i < keys.properties.length; i++) {

            var propID = keys.properties[i];

            // Retrieve properties
            var _properties$propID = properties[propID];
            var _name = _properties$propID.name;
            var value = _properties$propID.value;

            switch (_name) {

                case 'chiral':

                    if (atoms[propID] !== undefined) {
                        atoms[propID].properties.chiral = value.slice(value.indexOf('@'));
                        break;
                    }

                    break;

                case 'isotope':

                    // Determine neutrons, atomID
                    var neutrons = value.match(/[0-9]+/g),
                        atomID = 1 + neutrons.toString().length + parseInt(propID);

                    // Check value
                    if (neutrons > 0 && neutrons < 250 && atoms[atomID] !== undefined) {

                        // Subtract protons
                        neutrons = neutrons - atoms[atomID].protons;

                        if (neutrons > 0) {
                            atoms[atomID].neutrons = neutrons;
                            break;
                        }
                    }

                    break;

                case 'charge':

                    // Determine charge sign (positive/negative)
                    var sign = value.indexOf('+') !== -1 ? 1 : -1;

                    // Check numeric charge (e.g. '3+')
                    var charge = value.match(/(?:[^H])[0-9]+/g);

                    if (charge !== null && atoms[propID] !== undefined) {
                        charge = charge[0].substr(1);
                        atoms[propID].properties.charge = charge * sign;
                        break;
                    }

                    // Check symbolic charge (e.g. '+++')
                    charge = value.match(/([+]+|[-]+)/g);

                    if (charge !== null && atoms[propID] !== undefined) {
                        atoms[propID].properties.charge = charge[0].length * sign;
                        break;
                    }

                    break;
            }
        }

        return atoms;
    }

    function explicitBonds(atoms, bonds, keys) {

        if (keys.bonds.length === 0 || keys.bonds.length === undefined) {
            return [atoms, bonds, keys];
        }

        // Add bonds
        for (var i = 0; i < keys.bonds.length; i++) {

            // Retrieve bond key
            var bondID = keys.bonds[i];

            // Retrieve source/target atoms
            var sourceAtom = atoms[previousAtom(bondID, keys.all, atoms)],
                targetAtom = atoms[nextAtom(bondID, keys.all, atoms)];

            // Determine index values
            var bondIndex = keys.all.indexOf(bondID),
                sourceIndex = 0,
                targetIndex = 0;

            if (sourceAtom !== undefined && sourceAtom !== null) {
                sourceIndex = keys.all.indexOf(sourceAtom.id);
            }
            if (targetAtom !== undefined && targetAtom !== null) {
                targetIndex = keys.all.indexOf(targetAtom.id);
            }

            // Check for exceptions
            var exceptions = 0;

            if (targetIndex > bondIndex && bondIndex > sourceIndex) {

                // Check previous bond
                if (bonds[keys.all[bondIndex - 1]] !== undefined) {

                    var bond1 = bonds[keys.all[bondIndex - 1]].value,
                        bond2 = bonds[bondID].value;

                    // Exception: bond symbol follows branch end
                    if ((bond1 === ')' || bond1 === '(') && (bond2 === '-' || bond2 === '=' || bond2 === '#' || bond2 === '.')) {
                        exceptions = 1;
                    }
                }
            }

            // Bond type
            switch (bonds[bondID].name) {

                case 'single':
                    if (exceptions === 1) {
                        continue;
                    }
                    bonds[bondID].order = 1;
                    bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                    break;

                case 'double':
                    if (exceptions === 1) {
                        continue;
                    }
                    bonds[bondID].order = 2;
                    bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                    break;

                case 'triple':
                    if (exceptions === 1) {
                        continue;
                    }
                    bonds[bondID].order = 3;
                    bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                    break;

                case 'dot':
                    if (exceptions === 1) {
                        continue;
                    }
                    bonds[bondID].order = 0;
                    //bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                    break;

                case 'branch':

                    // Keys before/after branch
                    var keysBefore = keys.all.slice(0, bondIndex).reverse(),
                        keysAfter = keys.all.slice(bondIndex + 1, keys.all.length);

                    // Branch type
                    switch (bonds[bondID].value) {

                        // Start branch
                        case '(':

                            // Find start of branch
                            for (var j = 0, skip = 0; j < keysBefore.length; j++) {

                                // Determine source atom
                                sourceAtom = atoms[keysBefore[j]];

                                // Update bond
                                if (sourceAtom !== undefined && sourceAtom.name !== 'H' && skip === 0) {

                                    // Default bond properties
                                    var bondOrder = 1;

                                    // Check aromatic ring
                                    if (sourceAtom.properties.aromatic === 1 && targetAtom.properties.aromatic === 1) {
                                        bondOrder = 1.5;
                                    }

                                    bonds[bondID].order = bondOrder;
                                    bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                                    break;
                                }

                                // Check for nested branch
                                else if (bonds[keysBefore[j]] !== undefined) {

                                    switch (bonds[keysBefore[j]].value) {
                                        case ')':
                                            skip++;break;
                                        case '(':
                                            skip--;break;
                                    }
                                }
                            }

                            // Find target atom
                            for (var j = 0, bondOrder = bonds[bondID].order, skip = 0; j < keysAfter.length; j++) {

                                // Update bond order
                                if (bonds[keysAfter[j]] !== undefined && skip === 0) {

                                    switch (bonds[keysAfter[j]].value) {
                                        case '-':
                                            bondOrder = 1;break;
                                        case '=':
                                            bondOrder = 2;break;
                                        case '#':
                                            bondOrder = 3;break;
                                        case '.':
                                            bondOrder = 0;break;
                                    }
                                }

                                // Update bond order
                                if (skip === 0) {
                                    bonds[bondID].order = bondOrder;
                                    break;
                                }

                                // Check for nested branch
                                else if (bonds[keysAfter[j]] !== undefined) {

                                    switch (bonds[keysAfter[j]].value) {
                                        case ')':
                                            skip--;break;
                                        case '(':
                                            skip++;break;
                                    }
                                }
                            }

                            break;

                        // End branch
                        case ')':

                            // Find start of branch
                            for (var j = 0, skip = 1; j < keysBefore.length; j++) {

                                // Retrieve source atom
                                sourceAtom = atoms[keysBefore[j]];

                                // Update bond
                                if (sourceAtom !== undefined && sourceAtom.name !== 'H' && skip === 0) {

                                    // Default bond properties
                                    var bondOrder = 1;

                                    // Check aromatic ring
                                    if (sourceAtom.properties.aromatic === 1) {
                                        bondOrder = 1.5;
                                    }

                                    bonds[bondID].order = bondOrder;
                                    bonds[bondID].atoms[0] = sourceAtom.id;
                                    break;
                                }

                                // Check for nested branch
                                else if (bonds[keysBefore[j]] !== undefined) {

                                    switch (bonds[keysBefore[j]].value) {
                                        case ')':
                                            skip++;break;
                                        case '(':
                                            skip--;break;
                                    }
                                }
                            }

                            // Find end of branch
                            for (var j = 0, bondOrder = bonds[bondID].order, skip = 0; j < keysAfter.length; j++) {

                                // Retrieve target atom
                                targetAtom = atoms[keysAfter[j]];

                                // Update bond
                                if (bonds[keysAfter[j]] !== undefined && skip === 0) {

                                    switch (bonds[keysAfter[j]].value) {
                                        case '-':
                                            bondOrder = 1;break;
                                        case '=':
                                            bondOrder = 2;break;
                                        case '#':
                                            bondOrder = 3;break;
                                        case '.':
                                            bondOrder = 0;break;
                                    }
                                }

                                // Update bond
                                if (targetAtom !== undefined && skip === 0) {

                                    // Check aromatic ring
                                    if (targetAtom.properties.aromatic === 1) {
                                        bondOrder = 1.5;
                                    }

                                    bonds[bondID].order = bondOrder;
                                    bonds[bondID].atoms[1] = targetAtom.id;
                                    break;
                                }

                                // Check for nested branch
                                else if (bonds[keysAfter[j]] !== undefined) {

                                    switch (bonds[keysAfter[j]].value) {
                                        case ')':
                                            skip--;break;
                                        case '(':
                                            skip++;break;
                                    }
                                }
                            }

                            break;
                    }

                    break;

                case 'ring':

                    var sourceID = bonds[bondID].value.match(/[0-9]+/g);

                    // Keys before/after ring token
                    var bondsBefore = keys.bonds.slice(0, keys.bonds.indexOf(bondID)),
                        bondsAfter = keys.bonds.slice(keys.bonds.indexOf(bondID), keys.bonds.length);

                    // Check keys after ring token
                    for (var j = 1; j < bondsAfter.length; j++) {

                        if (bonds[bondsAfter[j]].name !== 'ring') {
                            continue;
                        }

                        var targetID = bonds[bondsAfter[j]].value.match(/[0-9]+/g),
                            _targetIndex = bondsAfter[j],
                            _sourceIndex = bondID;

                        if (sourceID !== null && targetID !== null && sourceID[0] === targetID[0]) {

                            while (atoms[_sourceIndex] === undefined && _sourceIndex >= -1) {
                                _sourceIndex -= 1;
                            }
                            while (atoms[_targetIndex] === undefined && _targetIndex >= -1) {
                                _targetIndex -= 1;
                            }

                            if (_sourceIndex === -1 || _targetIndex === -1) {
                                break;
                            }

                            // Update bond
                            var bondOrder = 1;

                            // Check aromatic
                            if (atoms[_sourceIndex].properties.aromatic === 1 && atoms[_targetIndex].properties.aromatic === 1) {
                                bondOrder = 1.5;
                            }
                            bonds[bondID].order = bondOrder;
                            bonds[bondID].atoms = [_sourceIndex.toString(), _targetIndex.toString()];

                            break;
                        }

                        // Check keys before ring token
                        if (j === bondsAfter.length - 1) {

                            // Find matching ring atom
                            for (var k = 0; k < bondsBefore.length; k++) {

                                if (bonds[bondsAfter[j]].name !== 'ring') {
                                    continue;
                                }

                                var _targetID = bonds[bondsBefore[k]].value.match(/[0-9]+/g),
                                    _targetIndex2 = bondID,
                                    _sourceIndex2 = bondsBefore[k];

                                if (sourceID !== null && _targetID !== null && sourceID[0] === _targetID[0]) {

                                    // Determine atom index
                                    while (atoms[_sourceIndex2] === undefined && _sourceIndex2 >= -1) {
                                        _sourceIndex2 -= 1;
                                    }
                                    while (atoms[_targetIndex2] === undefined && _targetIndex2 >= -1) {
                                        _targetIndex2 -= 1;
                                    }

                                    if (_sourceIndex2 === -1 || _targetIndex2 === -1) {
                                        break;
                                    }

                                    // Update bond
                                    var bondOrder = 1;

                                    // Check aromatic
                                    if (atoms[_sourceIndex2].properties.aromatic === 1 && atoms[_targetIndex2].properties.aromatic === 1) {
                                        bondOrder = 1.5;
                                    }

                                    bonds[bondID].order = bondOrder;
                                    bonds[bondID].atoms = [_sourceIndex2.toString(), _targetIndex2.toString()];

                                    break;
                                }
                            }
                        }
                    }

                    break;
            }
        }

        // Remove duplicate bonds
        for (var i = 0; i < keys.bonds.length; i++) {

            // Extract bonds after index
            var _bondsAfter = keys.bonds.slice(i, keys.bonds.length);

            // Check for duplicate/empty bonds
            for (var j = 0; j < _bondsAfter.length; j++) {

                // Bond keys
                var bondID = _bondsAfter[j],
                    a = bonds[keys.bonds[i]],
                    b = bonds[bondID];

                if (a === undefined || b === undefined || j === 0) {
                    continue;
                }

                // Check for empty bond reference
                if (a.atoms.length === 0) {
                    delete bonds[keys.bonds[i]];
                    delete keys.bonds[i];
                    continue;
                }
                if (b.atoms.length === 0) {
                    delete bonds[bondID];
                    delete keys.bonds[keys.bonds.indexOf(bondID)];
                    continue;
                }

                // Compare atom keys
                if (a.atoms[0] === b.atoms[0] && a.atoms[1] === b.atoms[1] || a.atoms[0] === b.atoms[1] && a.atoms[1] === b.atoms[0]) {

                    // Duplicate ring bond
                    if (a.name === 'ring' && b.name === 'ring') {
                        delete bonds[bondID];
                        delete keys.bonds[keys.bonds.indexOf(bondID)];
                    }

                    // Duplicate branching bonds
                    else if (a.name === 'branch' && (b.name === 'single' || b.name === 'double' || b.name === 'triple')) {
                        delete bonds[keys.bonds[i]];
                        delete keys.bonds[i];
                    } else if ((a.name === 'single' || a.name === 'double' || a.name === 'triple') && b.name === 'branch') {
                        delete bonds[bondID];
                        delete keys.bonds[keys.bonds.indexOf(bondID)];
                    }

                    // Other duplicate bonds
                    else {
                        delete bonds[keys.bonds[i]];
                        delete keys.bonds[i];
                    }

                    i--;
                    break;
                }
            }
        }

        // Remove empty references from keys
        for (var i = 0; i < keys.bonds.length; i++) {

            if (keys.bonds[i] === undefined) {
                keys.bonds.splice(i, 1);
                i--;
            }
        }

        // Add bond references to all atoms
        for (var i = 0; i < keys.bonds.length; i++) {

            // Bond key
            var bondID = keys.bonds[i];

            // Atom keys
            var _sourceID = bonds[bondID].atoms[0],
                targetID = bonds[bondID].atoms[1];

            if (_sourceID === undefined || targetID === undefined) {
                continue;
            }

            // Add bond reference to atom
            atoms[_sourceID].bonds.atoms.push(targetID);
            atoms[targetID].bonds.atoms.push(_sourceID);

            atoms[_sourceID].bonds.electrons += bonds[bondID].order;
            atoms[targetID].bonds.electrons += bonds[bondID].order;
        }

        return [atoms, bonds, keys];
    }

    function implicitBonds(atoms, bonds, keys) {

        // Add bonds between adjacent atoms
        for (var i = 0; i < keys.atoms.length; i++) {

            // Check conditions to proceed
            if (i + 1 === keys.atoms.length) {
                continue;
            }

            // Retrieve atoms
            var sourceAtom = atoms[keys.atoms[i]],
                targetAtom = atoms[keys.atoms[i + 1]];

            // Check for hydrogen
            var sourceIndex = i;

            while ((sourceAtom.name === 'H' || atoms[keys.atoms[sourceIndex]] === undefined) && sourceIndex > -1) {
                sourceAtom = atoms[keys.atoms[sourceIndex]];
                sourceIndex -= 1;
            }

            if (sourceIndex === -1) {
                continue;
            }

            // Default valence shell
            var sourceElectrons = 18,
                targetElectrons = 18;

            // Check for other group elements
            if (sourceAtom.group <= 2) {
                sourceElectrons = 2;
            } else if (sourceAtom.group < 13 && sourceAtom.group > 3) {
                sourceElectrons = 12;
            }
            if (targetAtom.group <= 2) {
                targetElectrons = 2;
            } else if (targetAtom.group < 13 && targetAtom.group > 3) {
                targetElectrons = 12;
            }

            var sourceTotal = sourceElectrons - sourceAtom.group - sourceAtom.bonds.electrons,
                targetTotal = targetElectrons - targetAtom.group - targetAtom.bonds.electrons;

            // Check atoms for exceptions
            if (sourceElectrons === 18 && sourceAtom.protons > 10) {
                if (sourceAtom.bonds.electrons > 4 && sourceTotal <= 0) {
                    sourceTotal += 4;
                }
            }
            if (targetElectrons === 18 && targetAtom.protons > 10) {
                if (targetAtom.bonds.electrons > 4 && targetTotal <= 0) {
                    targetTotal += 4;
                }
            }

            // Account for atom charge
            if (sourceAtom.properties.charge > 0) {
                sourceTotal -= sourceAtom.properties.charge;
            }
            if (targetAtom.properties.charge > 0) {
                targetTotal -= targetAtom.properties.charge;
            }

            if (sourceTotal <= 0 || targetTotal <= 0) {
                continue;
            }

            // Check if bond exists
            if (sourceAtom.bonds.atoms.indexOf(targetAtom.id) !== -1) {
                continue;
            }

            // Determine number of tokens between source/target atoms
            var n = keys.all.indexOf(targetAtom.id) - keys.all.indexOf(sourceAtom.id),
                exceptions = 0;

            // Check tokens preventing implicit bond
            if (n > 1) {

                // Extract all keys between source/target atoms
                var keysBetween = keys.all.slice(keys.all.indexOf(sourceAtom.id) + 1, keys.all.indexOf(targetAtom.id));

                for (var j = 0; j < keysBetween.length; j++) {

                    // Check for bond symbol
                    if (bonds[keysBetween[j]] !== undefined) {
                        if (bonds[keysBetween[j]].name !== 'ring') {
                            exceptions = 1;
                        }
                    }
                }
            }

            if (exceptions === 0) {

                // Assign new bond key
                var bondID = sourceAtom.name + sourceAtom.id + (targetAtom.name + targetAtom.id),
                    bondName = 'single',
                    bondValue = sourceAtom.name + targetAtom.name,
                    bondOrder = 1;

                // Check aromatic atoms
                if (sourceAtom.properties.aromatic === 1 && targetAtom.properties.aromatic === 1) {
                    bondName = 'aromatic';
                    bondOrder = 1.5;
                }

                // Update bonds
                keys.bonds.push(bondID);
                bonds[bondID] = addBond(bondID, bondName, bondValue, bondOrder, [sourceAtom.id, targetAtom.id]);

                // Update atoms
                atoms[sourceAtom.id].bonds.atoms.push(targetAtom.id);
                atoms[targetAtom.id].bonds.atoms.push(sourceAtom.id);

                atoms[sourceAtom.id].bonds.electrons += bondOrder;
                atoms[targetAtom.id].bonds.electrons += bondOrder;
            }
        }

        // Add implicit hydrogen
        var H = _referenceElements2['default'].H;

        for (var i = 0; i < keys.atoms.length; i++) {

            // Retrieve atoms
            var sourceAtom = atoms[keys.atoms[i]];

            // Check atom group
            if (sourceAtom.group < 13) {
                continue;
            }

            // Check for explicit hydrogen
            var bondCount = sourceAtom.bonds.atoms.length;

            for (var j = 0; j < bondCount; j++) {

                // Retrieve trget atom
                var targetID = sourceAtom.bonds.atoms[j],
                    targetAtom = atoms[targetID];

                // Check for hydrogen
                if (targetAtom.name === 'H') {

                    // Check for value
                    var count = parseInt(targetAtom.value.match(/[0-9]+/g));

                    if (count > 1 && count < sourceAtom.electrons) {

                        // Add hydrogen
                        for (var k = 0; k < count - 1; k++) {

                            var bondID = 'H' + (k + 1) + sourceAtom.name + sourceAtom.id,
                                bondName = sourceAtom.name + 'H';

                            // Add hydrogen atom/bond
                            atoms[bondID] = addAtom(bondID, 'H', 'H', H.group, H.protons, H.neutrons, H.electrons);
                            bonds[bondID] = addBond(bondID, 'hydrogen', bondName, 1, [sourceAtom.id, bondID]);

                            // Update atoms
                            atoms[sourceAtom.id].bonds.atoms.push(bondID);
                            atoms[bondID].bonds.atoms.push(sourceAtom.id);

                            atoms[sourceAtom.id].bonds.electrons += 1;
                            atoms[bondID].bonds.electrons += 1;
                        }
                    }
                }
            }

            // Determine number of hydrogen to add
            var sourceTotal = 18 - sourceAtom.group - sourceAtom.bonds.electrons;

            if (sourceTotal <= 0) {
                continue;
            }

            // Account for atom charge
            if (sourceAtom.properties.charge > 0) {
                sourceTotal -= sourceAtom.properties.charge;
            } else if (sourceAtom.properties.charge < 0) {
                sourceTotal += sourceAtom.properties.charge;

                // Lone pair (negative charge w/ 1 electron remaining)
                if (sourceTotal === 1) {
                    sourceTotal -= 1;
                    atoms[sourceAtom.id].bonds.electrons += 1;
                }
            }

            if (sourceTotal <= 0) {
                continue;
            }

            // Add hydrogen
            for (var j = 0; j < sourceTotal; j++) {

                // Check aromatic
                if (sourceAtom.properties.aromatic === 1 && j > 1) {
                    continue;
                }

                // Assign bond key
                var bondID = 'H' + (j + 1) + sourceAtom.name + sourceAtom.id,
                    bondName = sourceAtom.name + 'H';

                // Add hydrogen atom/bond
                atoms[bondID] = addAtom(bondID, 'H', 'H', H.group, H.protons, H.neutrons, H.electrons);
                bonds[bondID] = addBond(bondID, 'hydrogen', bondName, 1, [sourceAtom.id, bondID]);

                // Update atoms
                atoms[sourceAtom.id].bonds.atoms.push(bondID);
                atoms[bondID].bonds.atoms.push(sourceAtom.id);

                atoms[sourceAtom.id].bonds.electrons += 1;
                atoms[bondID].bonds.electrons += 1;
            }
        }

        return [atoms, bonds, keys];
    }

    var atoms = undefined,
        bonds = undefined,
        properties = undefined,
        keys = undefined;

    // 1. Validate tokens
    tokens = validateTokens(tokens);

    if (!tokens) {
        return false;
    }

    // 2. Categorize tokens

    var _readTokens = readTokens(tokens);

    var _readTokens2 = _slicedToArray(_readTokens, 4);

    atoms = _readTokens2[0];
    bonds = _readTokens2[1];
    properties = _readTokens2[2];
    keys = _readTokens2[3];

    // 3. Add atoms
    atoms = defaultAtoms(atoms, keys);
    atoms = customAtoms(atoms, properties, keys);

    // 4. Add bonds

    var _explicitBonds = explicitBonds(atoms, bonds, keys);

    var _explicitBonds2 = _slicedToArray(_explicitBonds, 3);

    atoms = _explicitBonds2[0];
    bonds = _explicitBonds2[1];
    keys = _explicitBonds2[2];

    var _implicitBonds = implicitBonds(atoms, bonds, keys);

    var _implicitBonds2 = _slicedToArray(_implicitBonds, 3);

    atoms = _implicitBonds2[0];
    bonds = _implicitBonds2[1];
    keys = _implicitBonds2[2];

    return { atoms: atoms, bonds: bonds };
}

/*
  Function    : compare
  Description : compare values across two arrays
*/

function compare(a, b) {
    var ab = arguments[2] === undefined ? [] : arguments[2];

    for (var i = 0; i < a.length; i++) {
        ab[i] = b.indexOf(a[i]) > -1 ? 1 : 0;
    }

    return ab;
}

/*
  Function    : addAtom
  Description : return new atom
*/

function addAtom(id, name, value) {
    var group = arguments[3] === undefined ? 0 : arguments[3];
    var protons = arguments[4] === undefined ? 0 : arguments[4];
    var neutrons = arguments[5] === undefined ? 0 : arguments[5];
    var electrons = arguments[6] === undefined ? 0 : arguments[6];

    return {

        // Atom name
        id: id,
        name: name,
        value: value,

        // Atom propeties
        group: group,
        protons: protons,
        neutrons: neutrons,
        electrons: electrons,

        // Bond properties
        bonds: {
            electrons: 0,
            atoms: []
        },

        // Other properties
        properties: {
            chiral: 0,
            charge: 0,
            aromatic: 0
        }
    };
}

/*
  Function    : addBond
  Description : return new bond
*/

function addBond(id, name, value) {
    var order = arguments[3] === undefined ? 0 : arguments[3];
    var atoms = arguments[4] === undefined ? [] : arguments[4];

    return {

        //Bond name
        id: id,
        name: name,
        value: value,

        // Bond properties
        order: order,
        atoms: atoms
    };
}

/*
  Function    : nextAtom
  Description : find key of next atom in array
*/

function nextAtom(start, keys, atoms) {

    var index = keys.indexOf(start);

    if (index !== -1) {
        keys = keys.slice(index, keys.length);

        for (var i = 1; i < keys.length; i++) {
            if (atoms[keys[i]] !== undefined) {
                return keys[i];
            }
        }
    }

    return null;
}

/*
  Function    : previousAtom
  Description : find key of previous atom in array
*/

function previousAtom(start, keys, atoms) {

    if (start === '0' && atoms['0'] !== undefined) {
        return '0';
    }

    var index = keys.indexOf(start);

    if (index !== -1) {
        keys = keys.slice(0, index).reverse();

        for (var i = 0; i < keys.length; i++) {
            if (atoms[keys[i]] !== undefined) {
                return keys[i];
            }
        }
    }

    return null;
}

/*
  Exports
*/

exports.tokenize = tokenize;
exports.decode = decode;
exports.grammar = grammar;
},{"./../reference/elements":3}],2:[function(require,module,exports){
/*
  molecules.js

  Description : chemical graph theory library
  Imports     : periodic_table, tokenize, decode
  Exports     : parse, adjacency, distance

*/

/*
  Imports
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _referenceElements = require('./reference/elements');

var _encodingSmiles = require('./encoding/smiles');

/*
  Function    : parse
  Description : convert SMILES --> tokens OR tokens --> molecule

  Syntax
    output = parse(input)

  Input
    1) 'string' (e.g. 'C2C(=O)C1COCCC1CC2')
    2) 'tokens' returned from output of 'a)'

  Output
    1) 'tokens' from a parsed SMILES string
    2) 'molecule' object from a set of tokens

  Examples
    1) tokens123 = parse('CC(=O)CC')
       tokensABC = parse('c1cccc1')
       butane.tokens = parse('CCCC')

    2) mol123 = parse(tokens123)
       molABC = parse(tokensABC)
       butane.molecule = parse(butane.tokens)
*/

function parse(input) {
    var encoding = arguments[1] === undefined ? 'SMILES' : arguments[1];

    switch (encoding.toUpperCase()) {

        case 'SMILES':

            // 1) String -> Tokens
            if (typeof input === 'string') {
                var _tokenize = (0, _encodingSmiles.tokenize)(input);

                var tokens = _tokenize.tokens;

                return tokens;
            }

            // 2) Tokens -> Molecule
            else if (typeof input === 'object') {
                var _decode = (0, _encodingSmiles.decode)(input);

                var atoms = _decode.atoms;
                var bonds = _decode.bonds;

                return Molecule(atoms, bonds);
            }

            return null;
    }
}

/*
  Function    : adjacency
  Description : return adjacency matrix of non-hydrogen atoms

  Syntax
    { header, matrix } = adjacency(molecule)

  Input
    molecule : object containing atoms and bonds

  Output
    header : atom identifier
    matrix : adjacency matrix

  Examples
    { header: id, matrix: adj } = adjacency(mol123)
    { header: names, matrix: matrix } = adjacency(molABC)
    { header: header123, matrix: data123 } = adjacency(myMolecule)
*/

function adjacency(molecule) {
    var header = arguments[1] === undefined ? [] : arguments[1];
    var matrix = arguments[2] === undefined ? [] : arguments[2];

    if (typeof molecule !== 'object') {
        return null;
    }

    var keys = Object.keys(molecule.atoms);

    // Extract non-hydrogen atoms
    for (var i = 0; i < keys.length; i++) {

        if (molecule.atoms[keys[i]].name !== 'H') {
            header.push(molecule.atoms[keys[i]].id);
        }
    }

    // Fill adjacency matrix
    matrix = Matrix(header.length);

    for (var i = 0; i < header.length; i++) {
        var source = molecule.atoms[header[i]];

        for (var j = 0; j < source.bonds.atoms.length; j++) {
            var target = molecule.atoms[source.bonds.atoms[j]],
                index = header.indexOf(target.id);

            if (target.name !== 'H' && index > 0) {
                matrix[i][index] = 1;
                matrix[index][i] = 1;
            }
        }
    }

    return { header: header, matrix: matrix };
}

/*
  Function    : distance
  Description : return matrix of shortest paths between non-hydrogen atoms

  Syntax
    { header, matrix } = distance(input)

  Input
    1) 'molecule' object
    2) 'adjacency' matrix

  Output
    header : atom identifier
    matrix : distance matrix

  Examples
    { header: id, matrix: d } = distance(adjacent123)
    { header: names, matrix: matrix } = distance(myMoleculeABC)
    { header: header123, matrix: dist123 } = distance(adj123)
    { header: atomID, matrix: shortestPaths } = distance(mol.butane)

  References
    R. Seidel, 'On the All-Pairs Shortest-Path Problem', ACM, (1992) 745-749.
*/

function distance(input) {
    var adjacent = arguments[1] === undefined ? input : arguments[1];
    var header = arguments[2] === undefined ? [] : arguments[2];
    var matrix = arguments[3] === undefined ? [] : arguments[3];
    return (function () {

        if (typeof input !== 'object') {
            return null;
        }

        // Molecule --> Adjacency matrix
        if (input.atoms !== undefined) {
            input = adjacency(input);
        }

        if (input.matrix !== undefined) {
            adjacent = input.matrix;
        }
        if (input.header !== undefined) {
            header = input.header;
        }

        // Validate adjacency matrix
        for (var i = 0; i < adjacent.length; i++) {
            if (adjacent[i].length !== adjacent.length) {
                return null;
            }
        }

        // Seidel's Algorithm (all-pairs shortest-paths)
        function Seidel(A) {
            var B = arguments[1] === undefined ? [] : arguments[1];
            var D = arguments[2] === undefined ? [] : arguments[2];

            var Z = Multiply(A, A);

            for (var _i = 0; _i < A.length; _i++) {
                B[_i] = [];

                for (var _j = 0; _j < A[0].length; _j++) {

                    if (_i !== _j && (A[_i][_j] === 1 || Z[_i][_j] > 0)) {
                        B[_i][_j] = 1;
                    } else {
                        B[_i][_j] = 0;
                    }
                }
            }

            var count = 0;

            for (var _i2 = 0; _i2 < B.length; _i2++) {
                for (var _j2 = 0; _j2 < B[0].length; _j2++) {

                    if (_i2 !== _j2 && B[_i2][_j2] === 1) {
                        count += 1;
                    }
                }
            }

            if (count === B.length * B.length - B.length) {
                return Subtract(Multiply(B, 2), A);
            }

            var T = Seidel(B),
                X = Multiply(T, A);

            var degree = [];

            for (var _i3 = 0; _i3 < A.length; _i3++) {
                degree[_i3] = A[_i3].reduce(function (a, b) {
                    return a + b;
                });
            }

            for (var i = 0; i < X.length; i++) {
                D[i] = [];

                for (var j = 0; j < X[0].length; j++) {

                    if (X[i][j] >= T[i][j] * degree[j]) {
                        D[i][j] = 2 * T[i][j];
                    } else if (X[i][j] < T[i][j] * degree[j]) {
                        D[i][j] = 2 * T[i][j] - 1;
                    }
                }
            }

            return D;
        }

        matrix = Seidel(adjacent);

        return { header: header, matrix: matrix };
    })();
}

/*
  Function    : Molecule
  Description : return new molecule
*/

function Molecule() {
    var atoms = arguments[0] === undefined ? {} : arguments[0];
    var bonds = arguments[1] === undefined ? {} : arguments[1];
    var id = arguments[2] === undefined ? 0 : arguments[2];
    var name = arguments[3] === undefined ? 0 : arguments[3];

    return {
        id: id,
        name: name,
        atoms: atoms,
        bonds: bonds,
        properties: {
            mass: Mass(atoms),
            formula: Formula(atoms)
        }
    };
}

/*
  Function    : Formula
  Description : return molecular formula
*/

function Formula(atoms) {
    var formula = arguments[1] === undefined ? {} : arguments[1];

    if (typeof atoms !== 'object') {
        return null;
    }

    var keys = Object.keys(atoms);

    for (var i = 0; i < keys.length; i++) {

        if (formula[atoms[keys[i]].name] === undefined) {
            formula[atoms[keys[i]].name] = 1;
        } else {
            formula[atoms[keys[i]].name] += 1;
        }
    }

    return formula;
}

/*
  Function    : Mass
  Description : determine molecular weight
*/

function Mass(atoms) {
    var mass = arguments[1] === undefined ? 0 : arguments[1];

    if (typeof atoms !== 'object') {
        return null;
    }

    var keys = Object.keys(atoms);

    for (var i = 0; i < keys.length; i++) {
        mass += atoms[keys[i]].protons + atoms[keys[i]].neutrons;
    }

    return Math.round(mass * 1000) / 1000;
}

/*
  Function    : Matrix
  Description : various matrix functions
*/

function Matrix(rows) {
    var columns = arguments[1] === undefined ? rows : arguments[1];
    var matrix = arguments[2] === undefined ? [] : arguments[2];
    return (function () {

        if (typeof rows !== 'number' || typeof columns !== 'number') {
            return null;
        }

        // Rows
        for (var i = 0; i < rows; i++) {
            matrix[i] = [];

            // Columns
            for (var j = 0; j < columns; j++) {
                matrix[i][j] = 0;
            }
        }

        return matrix;
    })();
}

/*
  Function    : Multiply
  Description : matrix multiplication
*/

function Multiply(a, b) {
    var output = arguments[2] === undefined ? [] : arguments[2];

    switch (typeof b) {

        case 'object':

            for (var i = 0; i < a.length; i++) {
                output[i] = [];

                for (var j = 0; j < b[0].length; j++) {
                    output[i][j] = 0;

                    for (var k = 0; k < a[0].length; k++) {
                        output[i][j] += a[i][k] * b[k][j];
                    }
                }
            }

            return output;

        case 'number':

            for (var i = 0; i < a.length; i++) {
                output[i] = [];

                for (var j = 0; j < a[0].length; j++) {
                    output[i][j] = a[i][j] * b;
                }
            }

            return output;
    }
}

/*
  Function    : Subtract
  Description : matrix subtraction
*/

function Subtract(a, b) {
    var output = arguments[2] === undefined ? [] : arguments[2];

    switch (typeof b) {

        case 'object':

            for (var i = 0; i < a.length; i++) {
                output[i] = [];

                for (var j = 0; j < a[0].length; j++) {
                    output[i][j] = a[i][j] - b[i][j];
                }
            }

            return output;

        case 'value':

            for (var i = 0; i < a.length; i++) {
                output[i] = [];

                for (var j = 0; j < a[0].length; j++) {
                    output[i][j] = a[i][j] - b;
                }
            }

            return output;
    }
}

/*
  Exports
*/

exports.parse = parse;
exports.adjacency = adjacency;
exports.distance = distance;
},{"./encoding/smiles":1,"./reference/elements":3}],3:[function(require,module,exports){
/*
  elements.js

  Description : basic properties of the elements
  Imports     : N/A
  Exports     : periodic_table

*/

/*
  Variable    : periodic_table
  Description : dictionary of atomic properties

  Fields
    protons   : atomic number
    neutrons  : weighted average number of neutrons
    electrons : total electrons
    group     : periodic table column number
    period    : periodic table row number
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var periodic_table = {

  'H': { protons: 1, neutrons: 0.0079, electrons: 1, group: 1, period: 1 },
  'He': { protons: 2, neutrons: 2.0026, electrons: 2, group: 18, period: 1 },
  'Li': { protons: 3, neutrons: 3.941, electrons: 3, group: 1, period: 2 },
  'Be': { protons: 4, neutrons: 5.0122, electrons: 4, group: 2, period: 2 },
  'B': { protons: 5, neutrons: 5.811, electrons: 5, group: 13, period: 2 },
  'C': { protons: 6, neutrons: 6.0107, electrons: 6, group: 14, period: 2 },
  'N': { protons: 7, neutrons: 7.0067, electrons: 7, group: 15, period: 2 },
  'O': { protons: 8, neutrons: 7.9994, electrons: 8, group: 16, period: 2 },
  'F': { protons: 9, neutrons: 9.9984, electrons: 9, group: 17, period: 2 },
  'Ne': { protons: 10, neutrons: 10.1797, electrons: 10, group: 18, period: 2 },
  'Na': { protons: 11, neutrons: 11.9897, electrons: 11, group: 1, period: 3 },
  'Mg': { protons: 12, neutrons: 12.305, electrons: 12, group: 2, period: 3 },
  'Al': { protons: 13, neutrons: 13.9815, electrons: 13, group: 13, period: 3 },
  'Si': { protons: 14, neutrons: 14.0855, electrons: 14, group: 14, period: 3 },
  'P': { protons: 15, neutrons: 15.9738, electrons: 15, group: 15, period: 3 },
  'S': { protons: 16, neutrons: 16.065, electrons: 16, group: 16, period: 3 },
  'Cl': { protons: 17, neutrons: 18.453, electrons: 17, group: 17, period: 3 },
  'Ar': { protons: 18, neutrons: 21.948, electrons: 18, group: 18, period: 3 },
  'As': { protons: 33, neutrons: 41.9216, electrons: 33, group: 15, period: 4 },
  'Se': { protons: 34, neutrons: 44.96, electrons: 34, group: 16, period: 4 },
  'Br': { protons: 35, neutrons: 44.904, electrons: 35, group: 17, period: 4 },
  'I': { protons: 53, neutrons: 73.9045, electrons: 53, group: 17, period: 5 }
};

/*
  Function    : Element
  Description : return info on element
*/

function Element(element) {

  if (periodic_table[element] !== undefined) {
    return periodic_table[element];
  }

  return null;
}

/*
  Exports
*/

exports['default'] = periodic_table;
module.exports = exports['default'];
},{}]},{},[2])(2)
});