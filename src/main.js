
import pako from 'pako'
import codecutils from 'codecutils'



export default class FilePuller {

  static read (f, readAsText, callback) {

    // this file is an HTML5 File, probably comes from a file diaglog
    if (f instanceof File) {
      let reader = new FileReader()

      // callback for reading the file as a binary file
      let onLoadEndBinaryFile = function( event ){
        let result = event.target.result

        // trying to un-gzip it with Pako
        try {
          result = pako.inflate(result).buffer
        } catch (err) {
        }

        // even though we are in the binary file reader, it could still be a gziped
        // text file, hence it could still contain strictly text but encoded as as Gziped unicode
        // read the content as text (unicode, ASCII compatible)
        if (readAsText) {
          var strResult = codecutils.CodecUtils.arrayBufferToUnicode(result)
          if( strResult && codecutils.CodecUtils.isValidString(strResult) ){
            result = strResult
          }else{
            callback(
              'The flag "readAsText" is set to true but this file does not contain text.', // error
              null // data
            )
            return
          }
        }

        callback(
          null, // error
          result // data
        )
      }


      // callback for reading the file as a text file
      let onLoadEndTextFile = function( event ){
        let result = event.target.result

        // try to read as text, but it's not text.
        // Maybe it's a gz-compressed text file, so we have to read this file as a
        // binary and see if once compressed it has a valid text content
        if(!codecutils.CodecUtils.isValidString(result)){
          reader.onloadend = onLoadEndBinaryFile
          reader.readAsArrayBuffer(f)
          return
        }

        callback(
          null, // error
          result // data
        )
      }

      reader.onerror = function(e) {
        callback(
          e,
          null
        )
      }


      if (readAsText) {
        reader.onloadend = onLoadEndTextFile
        reader.readAsText(f)
      } else {
        reader.onloadend = onLoadEndBinaryFile
        reader.readAsArrayBuffer(f)
      }


    // this is from a URL
    } else if((typeof f === 'string') || (f instanceof String)){

      let xhr = new XMLHttpRequest()
      xhr.open("GET", f, true)

      let onLoadEndBinaryFile = function(event) {
        let result = event.target.response 

        try {
          result = pako.inflate(result).buffer
        } catch (err) {
        }

        // even though we are in the binary reader callback, we can still be sent
        // here because of trying to read a compressed text
        // read the content as text (unicode, ASCII compatible)
        if( readAsText){
          var strResult = codecutils.CodecUtils.arrayBufferToUnicode(result)
          if( strResult && codecutils.CodecUtils.isValidString(strResult) ){
            result = strResult
          }else{
            callback(
              'The flag "readAsText" is set to true but this file does not contain text. Fetching data anyway.', // error
              result // data is expected to be compressed text but is not valid as a text, we still send it along with an error just in case the user wants it anyway
            )
            return
          }
        }

        callback(
          null, //error
          result // data
        )
      }

      var onLoadEndTextFile = function(event) {
        var result = event.target.response

        // try to read as text, but it's not text.
        // Maybe it's a gz-compressed text file, so we have to read this file as a
        // binary and see if once uncompressed it has a valid text content
        if(!codecutils.CodecUtils.isValidString(result)){
          event.target.abort()
          // xhrBackup is used only when reading as a text is not possible (binary file)
          // it is then used in case of failure of reading text in the first place
          var xhrBackup = new XMLHttpRequest()
          xhrBackup.open("GET", f, true)
          xhrBackup.responseType = "arraybuffer"
          xhrBackup.onload = onLoadEndBinaryFile
          xhrBackup.send()
          return
        }

        callback(
          null, //error
          result // data
        )
      }

      xhr.error = function(e){
        callback(
          e,
          null
        )
      }

      if( readAsText ){
        xhr.responseType = "text"
        xhr.onload = onLoadEndTextFile
      }else{
        xhr.responseType = "arraybuffer"
        xhr.onload = onLoadEndBinaryFile
      }

      xhr.send()
    }
  }
}
