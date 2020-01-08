
var APP = {

	Player: function () {

		var scope = this;

		var loader = new THREE.ObjectLoader();

	//	var vr, controls, effect;
	//	var camera, scene, renderer;

		var events = {}; // important!

		this.dom = document.createElement( "div" );

		this.width = 500;
		this.height = 500;

		this.signals = {};

	//	Load app.json.

		this.load = function ( json ) {

		//	Config.

			vr = json.project.vr;
			debugMode = json.project.debugMode; // important! 
			THREE.Cache.enabled = json.project.cache; // important!
			console.log({ "vr": vr, "debugMode": debugMode, "cache": THREE.Cache.enabled });

		//	Renderer (is global for debug only).

			renderer = new THREE.WebGLRenderer({ 
				antialias: true,
				preserveDrawingBuffer: true,
            });

			renderer.setClearColor( 0x000000 );
			renderer.setPixelRatio( window.devicePixelRatio );

			if ( json.project.shadows ) {

				renderer.shadowMap.enabled = true;
			//	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

			}

			this.dom.appendChild( renderer.domElement );
			this.setScene( loader.parse( json.scene ) );
			this.setCamera( loader.parse( json.camera ) );

			events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				mousedown: [],
				mouseup: [],
				mousemove: [],
				touchstart: [],
				touchend: [],
				touchmove: [],
				update: [],
			};

			var scriptWrapParams = "app,renderer,scene,camera,controls";
			var scriptWrapResultObj = {};

			for ( var eventKey in events ) {

				scriptWrapParams += "," + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;

			}

			var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, "" );

		//

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( "uuid", uuid, true ); // important!

				if ( object === undefined ) {

					console.warn( "Scripts of uuid:", uuid, "are orphan. Orphan scripts get \"window\" as \"this\"." ); // continue;

				}

				var scripts = json.scripts[ uuid ]; 

				for ( var i = 0; i < scripts.length; i ++ ) {

					var script = scripts[ i ];

				//	if "object" is "null", "this" of functions will become the "window".

					var functions = ( new Function( scriptWrapParams, script.source + "\nreturn " + scriptWrapResult + ";" ).bind( object ) )( this, renderer, scene, camera );
					
				//	debugMode && console.log( "functions:", functions );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( "APP: Event type not supported (", name, ")" ); 

							continue;

						}

						events[ name ].push( functions[ name ].bind( object ) );

					}

				}

			}

			debugMode && console.log( "events:", events );

			
			dispatch( events.init, arguments );

		};

	//	Execute script in window scope.

		this.setLibrary = function() {

		//  arguments: source (text) code only.

			for (var i in arguments){

				var script = new Function( arguments[ i ] ); 
				script.bind( window ).call(); // bind and execute script.
				debugMode && console.log("Library", script.toString(), "executed.");

			}

		};

	//	Load libraries.

		this.loadLibrary = function(){

			var loader = new THREE.XHRLoader();

			for ( var i in arguments ){

				loader.load( arguments[i], this.setLibrary );
				console.log( "Library", arguments[i], "loaded.");

			}

		};

	//	Camera.

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			if ( vr === true ) {

				if ( camera.parent === null ) {

				//	camera needs to be in the scene so camera2 matrix updates.

					scene.add( camera );

				}

				var camera2 = camera.clone();
				camera.add( camera2 );

				camera = camera2;

				controls = new THREE.VRControls( camera );
				effect = new THREE.VREffect( renderer );

				if ( WEBVR.isAvailable() === true ) {

					this.dom.appendChild( WEBVR.getButton( effect ) );

				}

				if ( WEBVR.isLatestAvailable() === false ) {

					this.dom.appendChild( WEBVR.getMessage() );

				}

			}

		};

	//	Scene.

		this.setScene = function ( value ) {

			scene = value;

		};

	//	Renderer.

		this.setSize = function ( width, height ) {

			if ( renderer && renderer._fullScreen ) return;

			this.width = width;
			this.height = height;

            if ( camera ) {

                camera.aspect = this.width / this.height;
                camera.updateProjectionMatrix();

            }

			if ( renderer ) renderer.setSize( width, height );

		};

	//	Dispatch.

		function dispatch( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		}

	//	Animate.

		var prevTime, request;

		function animate( time ) {

			request = requestAnimationFrame( animate );

			try {

				dispatch( events.update, { time: time, delta: time - prevTime } );

			} catch ( e ) {

				console.error( ( e.message || e ), ( e.stack || "" ) );

			}

			if ( vr === true ) {

				controls.update();
				effect.render( scene, camera );

			} else {

				renderer.render( scene, camera );

			}

			prevTime = time;

		}

	//	Play/Stop.

		this.play = function () {

			document.addEventListener( "keydown", onDocumentKeyDown );
			document.addEventListener( "keyup", onDocumentKeyUp );
			document.addEventListener( "mousedown", onDocumentMouseDown );
			document.addEventListener( "mouseup", onDocumentMouseUp );
			document.addEventListener( "mousemove", onDocumentMouseMove );
			document.addEventListener( "touchstart", onDocumentTouchStart );
			document.addEventListener( "touchend", onDocumentTouchEnd );
			document.addEventListener( "touchmove", onDocumentTouchMove );

			dispatch( events.start, arguments );

			request = requestAnimationFrame( animate );
			prevTime = performance.now();

		};

		this.stop = function () {

			document.removeEventListener( "keydown", onDocumentKeyDown );
			document.removeEventListener( "keyup", onDocumentKeyUp );
			document.removeEventListener( "mousedown", onDocumentMouseDown );
			document.removeEventListener( "mouseup", onDocumentMouseUp );
			document.removeEventListener( "mousemove", onDocumentMouseMove );
			document.removeEventListener( "touchstart", onDocumentTouchStart );
			document.removeEventListener( "touchend", onDocumentTouchEnd );
			document.removeEventListener( "touchmove", onDocumentTouchMove );

			dispatch( events.stop, arguments );

			cancelAnimationFrame( request );

		};

	//	Dispose.

		this.dispose = function () {

			while ( this.dom.children.length ) {

				this.dom.removeChild( this.dom.firstChild );

			}

			renderer.dispose();

		};

	//	Event handlers.

		function onDocumentKeyDown( event ) {

			dispatch( events.keydown, event );

		}

		function onDocumentKeyUp( event ) {

			dispatch( events.keyup, event );

		}

		function onDocumentMouseDown( event ) {

			dispatch( events.mousedown, event );

		}

		function onDocumentMouseUp( event ) {

			dispatch( events.mouseup, event );

		}

		function onDocumentMouseMove( event ) {

			dispatch( events.mousemove, event );

		}

		function onDocumentTouchStart( event ) {

			dispatch( events.touchstart, event );

		}

		function onDocumentTouchEnd( event ) {

			dispatch( events.touchend, event );

		}

		function onDocumentTouchMove( event ) {

			dispatch( events.touchmove, event );

		}

	}

};