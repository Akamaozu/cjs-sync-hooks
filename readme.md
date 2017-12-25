#CJS-SYNC-HOOKS#

Make Your Code Extendable By Creating Hooks for Modifying Behavior and Values
---
[![Build Status](https://travis-ci.org/Akamaozu/cjs-sync-hooks.svg?branch=master)](https://travis-ci.org/Akamaozu/cjs-sync-hooks)
[![Coverage Status](https://coveralls.io/repos/github/Akamaozu/cjs-sync-hooks/badge.svg?branch=master)](https://coveralls.io/github/Akamaozu/cjs-sync-hooks?branch=master)

## Install
    npm install --save cjs-sync-hooks

## Basic Usage

### Create a Hook Instance
    var hook = require( 'cjs-sync-hooks' )();

### Add Middleware
    hook.add( 'output', 'prepend-subsystem-name', function( output ){
      var subsystem = 'heroku-formatting-12345',
          prefix = '['+ subsystem + '] ';

      return prefix + output; 
    });

### Run Hook Stack
    var output = hook.run( 'output', 'hello world!' );

    console.log( output ); 
    // [heroku-formatting-12345] hello world!

## Advanced Usage

### Prematurely Stop Running Hook Stack
#### Useful for Pattern-Matching: exit stack when compatible middleware is found.
    hook.add( 'stdin', 'handle-string', function( input ){
      if( typeof input !== 'string' ) return;

      // do something with string then
      hook.end();
    });

    hook.add( 'stdin', 'handle-number', function( input ){
      if( typeof input !== 'number' ) return;

      // do something with number then
      hook.end();
    });

    process.on( 'data', function( data ){
      hook.run( 'stdin', data );
    });

### Nested Hooks
    var message = {
      to: 'timmy',
      from: 'tommy',
      content: 'you should check *this* out https://youtu.be/dQw4w9WgXcQ'
    };

    hook.add( 'message-to-send', 'markdown-to-html', function( message ){
      var pre_markdown_expanded_message = hook.run( 'pre-markdown-to-html', message );

      // convert markdown to html

      return markdown_expanded_message;
    });

    hook.add( 'pre-markdown-to-html', 'convert-url-to-markdown-link', function( message ){

      // replace urls with markdown links

      return url_to_markdown_message;
    });

    app.send( hook.run( 'message-to-send', message ) );