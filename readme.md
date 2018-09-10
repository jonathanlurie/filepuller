# filepuller
Read a file using a single unique function no matter that they come from a file dialog, a URL, that they are gzipped of not.

See the DEMO in `examples/browser.html`

**Example 1: read a JSON file over HTTP request**
```javascript
// whether or not you expect this file to contain text of compressed text
let readAsText = true

// using FilePuller with distant files JSON file
filepuller.read('data/AA0250.json', readAsText, function(err, data){
  if (err) {
    console.warn(err)
    return
  }

  console.log("This is the content of the JSON file:");
  console.log(JSON.parse(data))
})
```

**Example 2: read a gzipped file over HTTP request**
```javascript
// whether or not you expect this file to contain text of compressed text
let readAsText = true

// using FilePuller with distant files JSON file
filepuller.read('data/AA0250.json.gz', readAsText, function(err, data){
  if (err) {
    console.warn(err)
    return
  }

  console.log("This is the content of the JSON file:");
  console.log(JSON.parse(data))
})
```

**Example 3: read a file (whether gzipped or not) using a file dialog**
Say you have a declared a file dialog button in your page
```html
<input type="file" id="fileInput" multiple>
```

Then, the `on change` event will open it.
```javascript
let fileInput = document.getElementById('fileInput');

// whether or not you expect this file to contain text of compressed text
let readAsText = true

fileInput.addEventListener('change', function(e) {
  let files = e.target.files;

  if( !files.length ){
    return;
  }

  for(let i=0; i<files.length; i++){
    let reader = new FileReader()

    filepuller.read( files[i], readAsText, function(error, data){
      if (error) {
        console.warn(err)
        return
      }

      console.log("This is the content of the file:")
      console.log(JSON.parse(data))
    })
  }
})
```

Note that `readAsText` is an option to tell if you expect the file to contain text, whether compressed or not.
Here are few use cases about that:
- If you expect text on a compressed file, the binary data will be converted into unicode
- If you expect text but the conversion to unicode give a majority of non-valid unicode characters, you will have both an error and the result. This result will be the buffer as an `ArrayBuffer`
- If you expect binary (`readAsText = false`) on a text file (compressed or not), an `ArrayBuffer` will be given
