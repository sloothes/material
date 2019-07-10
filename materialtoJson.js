//  materialtoJson.js (v1.5.3)

//  MATERIAL TO JSON.
//  Return a promise with the 
//  material json object resolved.

    function materialtoJSON( material ){


    //  MULTIMATERIAL.

        if ( material.type == "MultiMaterial" ) {


        //  multimaterial to json.

            var multjson = {

                _id: "",
                type: material.type,
                uuid: material.uuid || THREE.Math.generateUUID(),

            };


        //  materials to json.

            multjson.materials = [];

            for ( var i = 0; i < material.materials.length; i++ ){

                multjson.materials.push( materialtoJSON( material.materials[i] ) );

            }


            debugMode && console.log( "multimaterial to json:", multjson );

            return multjson;

        }


    //  MATERIAL.

        var json = {};

        for ( var name in material ){

            if ( material[ name ] == undefined ) continue;         // important!
            if ( material[ name ] instanceof Function ) continue;  // important!
            if ( typeof(material[name]) === "function" ) continue; // important!

            switch( name ){

                case "defines":
                case "program":
                case "_listeners":
                case "needsUpdate":
                case "_needsUpdate":
                case "__webglShader":
                break;


            //  uuid.

                case "uuid":
                    json.uuid = material.uuid || THREE.Math.generateUUID();
                break;


            //  name && _id.

                case "name":
                    json._id = material[ name ];
                    json[ name ] = material[ name ];
                break;


            //  texture to json.

                case "map":
                case "bumpMap":
                case "alphaMap":
                case "normalMap":
                case "emissiveMap":
                case "displacementMap":
                case "metalnessMap":
                case "roughnessMap":
                case "specularMap":
                case "lightMap":
                case "aoMap":

                    if ( !(material[ name ] instanceof THREE.Texture) ) {
                        throw `${name} is not instance of THREE.Texture`;
                    }

                    json[ name ] = texturetoJSON( material[ name ] );

                break;


            //  three color to hex.

                case "color":
                case "emissive":
                case "specular":

                    if ( !(material[ name ] instanceof THREE.Color) ) {
                        throw `${name} is not instance of THREE.Color`;
                    }

                    json[ name ] = material[ name ].getHex();

                break;


            //  vector2 to array.

                case "normalScale":

                    if ( !(material[ name ] instanceof THREE.Vector2) ) {
                        throw `${name} is not instance of THREE.Vector2`;
                    }

                    json[ name ] = material[ name ].toArray();

                break;



                case "envMap":
                    //  TODO: cube texture.
                break;


                default:
                    json[ name ] = material[ name ];
                // "default" should not have "break"?  // danger!
                break;

            }

        }


    //  debugMode && console.log({"material to json": json});

        return json;

    }


//  TEXTURE TO JSON.
//  Return a promise resolved 
//  with the texture json object.

    function texturetoJSON( texture ){

        var json = {};

        for (var name in texture ){

            if ( texture[ name ] == undefined ) continue;
            if ( texture[ name ] instanceof Function ) continue;
            if ( typeof(texture[name]) === "function" ) continue;

            switch (name){

                case "_listeners":
                break;


            //  uuid.

                case "uuid":
                    json[ name ] = texture[ name ] || THREE.Math.generateUUID();
                break;


            //  vector2 to array.

                case "offset":
                case "repeat":
                    json[ name ] = texture[ name ].toArray();
                break;


            //  image to json.

                case "image":
                    json[ name ] = texture.sourceFile || getDataURL( texture[ name ] ); // important!
                break;


                default:
                    json[ name ] = texture[ name ];
                // "default" should not have "break"?  // danger!
                break;

            }

        }

        return json;

    }


//  IMAGE TO JSON.
//  Return an image object.

    function imagetoJSON( image ){

        return {
            uuid: THREE.Math.generateUUID(),
            src: image.src || getDataURL( image ),
        };

    }

//  TEXTURE IMAGE TO JSON.
//  Return an image object.

    function textureImagetoJSON( texture ){

        return {
            uuid: THREE.Math.generateUUID(),
            src: texture.sourceFile || texture.image.src || getDataURL( texture.image )
        };

    }



//  materialfromJson.js (v1.5.1)

//  MATERIAL FROM JSON.
//  Return a promise with the material resolved.

    function materialfromJSON( json ){

   //  MULTIMATERIAL.

       if ( json.type == "MultiMaterial" ) {


           var materials = [];

           for ( var i = 0; i < json.materials.length; i++ ){

               materials.push( materialfromJSON( json.materials[i] ) );

           }


       //  Create multimaterial.

           var multimaterial = new THREE.MeshFaceMaterial(materials);

           multimaterial.uuid = json.uuid || THREE.Math.generateUUID();

           return multimaterial;

        }


    //  MATERIAL.

        var options = {};

        for (var name in json){

            if ( json[ name ] == undefined ) continue; // important!


            switch (name){

                case "_id":
                break;


            //  uuid.

                case "uuid":
                    options.uuid = json.uuid || THREE.Math.generateUUID();
                break;


            //  texture from json.

                case "alphaMap":
                case "aoMap":
                case "bumpMap":
                case "displacementMap":
                case "emissiveMap":
                case "lightMap":
                case "map":
                case "metalnessMap":
                case "normalMap":
                case "roughnessMap":
                case "specularMap":

                        options[ name ] = texturefromJSON( json[ name ] );

                break;


            //  three color to hex.

                case "color":
                case "emissive":
                case "specular":

                    options[ name ] = new THREE.Color();
                    options[ name ].setHex( json[ name ] );

                break;


            //  vector2 from array.

                case "normalScale":

                    options[ name ] = new THREE.Vector2();
                    options[ name ].fromArray( json[ name ] );

                break;


                case "envMap":
                    //  TODO: cube texture.
                break;


                default:
                    options[ name ] = json[ name ];
                // "default" should not have "break"?  // danger!
                break;

            }

        }

        return new THREE[ options.type ](options);

    }


//  TEXTURE FROM JSON (v1.5.3)
//  Return a promise with the texture resolved.

    function texturefromJSON( json ){

        var texture = new THREE.Texture();

        for ( var name in json ){

            switch (name){

                case "meta":
                case "image":
                break;

            //  array to vector2.

                case "offset":
                case "repeat":

                    if ( json[ name ].length != 2) break;

                    texture[ name ] = new THREE.Vector2();
                    texture[ name ].fromArray( json[ name ] );

                break;


            //  wrapS & wrapT.

                case "wrap":

                    if ( json[ name ].length != 2) break;
                    if ( !( json[ name ] instanceof Array ) ) break;

                    texture.wrapS = json[ name ][0];
                    texture.wrapT = json[ name ][1];

                break;

            //  image from texture json with"FileReader.readAsDataURL(blob)".

                //  Check whether a match for the request is found in   
                //  the CacheStorage using CacheStorage.match(). If so, serve that.

                //  If not, open the "textures" cache using open(), 
                //  put the default network request in the cache using Cache.put() 
                //  and return a clone of the default network request using return response.clone().

                //  Clone is needed because put() consumes the response body.
                //  If this fails (e.g., because the network is down), return a fallback response.

                //  Pros:

                    //  Easy to use.
                    //  Small, compact, safe code.
                    //  Texture.image.src is string.
                    //  Texture.image.src is dataURL.
                    //  Texture.image.src can reused.
                    //  Texture.image.src is always valid.
                    //  Texture.image.src can be send everywhere.
                    //  Texture.image.src can converted to canvas.
                    //  Texture.image (canvas) size always power of 2.
                    //  Texture.image.src can saved in storage objects.
                    //  Texture.image.src can converted vice versa to blob.

                //  Cons:

                    //  Larger size (33%)

        /*
            //  sourceFile.
                case "sourceFile":
                    texture.sourceFile = json[ name ]; // important!
                break;
        */

            //  case "image": (N/A).
                case "sourceFile":

                    texture.sourceFile = json.sourceFile;

                //  SourceFile first.
                    var url = json.sourceFile || json.image.src || json.image || "https://i.imgur.com/ODeftia.jpg";
                //  debugMode && console.log( url );

                //  URL.

                    if ( validator && validator.isURL( url ) ) {

                    //  Cache first.
                        caches.match( url ).then(function(response){

                            if ( !response ) 
                                throw response;
                            else
                                return response;

                        }).catch(function(err){

                        //  We use cors origin mode to avoid
                        //  texture tainted canvases, images.

                            return fetch( url, {
                                mode: "cors",  // important!
                                method: "GET",
                            });

                        }).then(async function(response){

                            var cache = await caches.open("textures")
                            .then(function(cache){ return cache; });

                        //  Clone is needed because put() consumes the response body.
                        //  See: "https://developer.mozilla.org/en-US/docs/Web/API/Cache/put"

                            var clone = response.clone();
                            await cache.put( url, clone );

                            return response.blob();         //  important!

                        }).then(function(blob){

                            var img = new Image();
                            img.crossOrigin = "anonymous";  //  important!

                            $(img).one("load", function(){
                            //  texture.image = img;        //  or...
                                var canvas = makePowerOfTwo( img, true );
                                texture.image = canvas;
                                if (canvas) $(img).remove(); // optional.
                                texture.needsUpdate = true;
                            });

                        //  Get dataURL from blob.

                            var reader = new FileReader();
                            reader.onload = function() {
                                img.src = reader.result;
                            };

                            reader.readAsDataURL(blob);

                        });
                        
                        break;
                    } 

                //  DataURL.

                    if ( validator && validator.isDataURI( url ) ) {
                        var img = new Image();
                        img.crossOrigin = "anonymous";
                        $(img).one("load", function(){
                            var canvas = makePowerOfTwo( img, true );
                            texture.image = canvas;
                            if (canvas) $(img).remove();
                            texture.needsUpdate = true;
                        }).attr({src: url});  break;
                    } 

                break;

                default:
                    texture[ name ] = json[ name ];
                break;

            }

        }

        return texture;

    }



//  IMAGE FROM JSON (v1.5.1)
//  Return a promise with the image resolved.

    function imagefromJSON( json, onLoadEnd ){

        var url = json.src;

    //  Cache first.
        caches.match( url ).then(function(response){

            if ( !response ) 
                throw response;
            else
                return response;

        }).catch(function(err){

            //  We use cors origin mode to avoid
            //  texture tainted canvases, images.

            return fetch( url, {
                mode: "cors",               // important!
                method: "GET",
            });

        }).then(async function(response){

            var cache = await caches.open("textures")
            .then(function(cache){ return cache; });

        //  Clone is needed because put() consumes the response body.
        //  See: "https://developer.mozilla.org/en-US/docs/Web/API/Cache/put"

            var clone = response.clone();
            await cache.put( url, clone );

            return response.blob();         //  important!

        }).then(function(blob){

            var img = new Image();
            img.crossOrigin = "anonymous";  //  important!
            if ( onLoadEnd ) $(img).one("load", onLoadEnd);

        //  Get dataURL from blob.

            return new Promise(function(resolve, reject){

                var reader = new FileReader();
                reader.onload = function() {
                    img.src = reader.result;
                    resolve( img );
                };

                reader.readAsDataURL(blob);

            });

        });

    }

//  blobToDataUrl.js
//  https://gist.github.com/tantaman/6921973

    function convertToBase64(blob, callback) {

        var reader = new FileReader();

        reader.onload = function(e) {
            callback(reader.result);
        };

        reader.readAsDataURL(blob);
    }


//  dataUrlToBlob.js
//  https://gist.github.com/tantaman/6921973

    function dataURLToBlob(dataURL) {

        var BASE64_MARKER = ";base64,";

        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(",");
            var contentType = parts[0].split(":")[1];
            var raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(":")[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }


//  makePowerOfTwo.js

    function makePowerOfTwo( image, natural ) {

        var canvas = document.createElement( "canvas" );

        if ( natural ){
            canvas.width = THREE.Math.nearestPowerOfTwo( image.naturalWidth );
            canvas.height = THREE.Math.nearestPowerOfTwo( image.naturalHeight );
        } else {
            canvas.width = THREE.Math.nearestPowerOfTwo( image.width );
            canvas.height = THREE.Math.nearestPowerOfTwo( image.height );
        }

        var context = canvas.getContext( "2d" );
        context.drawImage( image, 0, 0, canvas.width, canvas.height );

    //  debugMode && console.warn( "outfitLoader:makePowerOfTwo(img):", 
    //  "Image resized to:", canvas.width, "x", canvas.height );

        return canvas;
    }



//  getDataURL.js

    function getDataURL( image ) {

        var canvas;

        if ( image.toDataURL !== undefined ) {

            canvas = image;

        } else {

            canvas = document.createElementNS( "http://www.w3.org/1999/xhtml", "canvas" );
            canvas.width = image.width;
            canvas.height = image.height;

            canvas.getContext( "2d" ).drawImage( image, 0, 0, image.width, image.height );

        }

        if ( canvas.width > 2048 || canvas.height > 2048 ) {

            return canvas.toDataURL( "image/jpeg", 0.6 );

        } else {

            return canvas.toDataURL( "image/png" );

        }

    }

//  deepCopy.js

    function deepCopy(obj) {
        if (Object.prototype.toString.call(obj) === "[object Array]") {
            var out = [], i = 0, len = obj.length;
            for ( ; i < len; i++ ) {
                out[i] = arguments.callee(obj[i]);
            }
            return out;
        }
        if (typeof obj === "object") {
            var out = {}, i;
            for ( i in obj ) {
                out[i] = arguments.callee(obj[i]);
            }
            return out;
        }
        return obj;
    }

//  round.js  source: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round"

    function round(number, precision) {
        var shift = function (number, precision, reverseShift) {
            if (reverseShift) {
                precision = -precision;
            }  
            numArray = ("" + number).split("e");
            return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
        };
        return shift(Math.round(shift(number, precision, false)), precision, true);
    }
