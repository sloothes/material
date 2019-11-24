//  MATERIAL TO JSON.

//  materialtoJson.js (v1.6)
//  Return a promise with the 
//  material json object resolved.


function materialtoJSON( material ){

	//  MULTIMATERIAL.

	if ( material.type == "MultiMaterial" || material.materials ) {

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


		//  name, _id, uuid.

			case "name":
				json.name = material.name;
			break;

			case "_id":
				json._id = material._id || ObjectId();
			break;

			case "uuid":
				json.uuid = material.uuid || THREE.Math.generateUUID();
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
					throw name + " is not instance of THREE.Texture";
				}

				json[ name ] = texturetoJSON( material[ name ] );

			break;


		//  three color to hex.

			case "color":
			case "emissive":
			case "specular":

				if ( !(material[ name ] instanceof THREE.Color) ) {
					throw name + " is not instance of THREE.Color";
				}

				json[ name ] = material[ name ].getHex();

			break;


		//  vector2 to array.

			case "normalScale":

				if ( !(material[ name ] instanceof THREE.Vector2) ) {
					throw name + " is not instance of THREE.Vector2";
				}

				json[ name ] = material[ name ].toArray();

			break;



			case "envMap":
				//  TODO: cube texture.
			break;


			default:
				json[ name ] = material[ name ];
			break;

		}

	}

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
		src: texture.sourceFile || texture.image.src || getDataURL( texture.image ),
	};

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



//  MATERIAL FROM JSON.
//  materialfromJson.js (v1.7)

function materialfromJSON( json ){

//  MULTIMATERIAL.

	if ( json.materials && json.materials.length ) {

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
			case "meta":
			break;


		//  uuid.

			case "uuid":
				options.uuid = json.uuid || THREE.Math.generateUUID();
			break;


		//  texture from json.

			case "map":
			case "aoMap":
			case "bumpMap":
			case "alphaMap":
			case "lightMap":
			case "normalMap":
			case "emissiveMap":
			case "specularMap":
			case "metalnessMap":
			case "roughnessMap":
			case "displacementMap":

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
			break;

		}

	}

	return new THREE[ options.type ](options);

}


//  TEXTURE FROM JSON (v1.7)

function texturefromJSON( json ){

	var loader = new THREE.TextureLoader()
	loader.setCrossOrigin(""); // important!
	var url = json.sourceFile || json.image || "https://i.imgur.com/ODeftia.jpg";
	var texture = loader.load( url );
	texture.sourceFile = url;

	for ( var name in json ){

		switch (name){

			case "meta":
			case "image":
			case "sourceFile":
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

			default:
				texture[ name ] = json[ name ];
			break;

		}

	}

	return texture;

}


//  IMAGE FROM JSON (v1.7)

function imagefromJSON( json, onLoad, onProgress, onError ){

	var url = json.src || json.url || json.data;
	if ( url === undefined ) return new Image();

	var loader = new THREE.ImageLoader()
//  Use cors origin "anonymous" to avoid tainted image.
	loader.setCrossOrigin("anonymous"); // important!
	return loader.load( url, onLoad, onProgress, onError );

}

