function makeImage(context) {

  // We are passed a context variable when we're run.
  // We use this to get hold of a javascript object
  // which we can use in turn to manipulate Sketch.
  var sketch = context.api()

  log('SketchDebug: Running')

  var document = sketch.selectedDocument;
  var page = document.selectedPage;
  var selection = document.selectedLayers;
  var selectionCount = selection.length;

  var doc = context.document;
  artboard = doc.currentPage().currentArtboard();

  log('SketchDebug: ' + selectionCount);
  if (selectionCount > 0) {
    selection.iterate(function(layer) {
      log('SketchDebug: ' + layer.name + ' is image -> ' + layer.isImage);
      if (!layer.isImage) {
        sketch.message(layer.name + ' is not an image!');
      } else {
        var artboard = getArtboard(layer);
        var mask = artboard.newShape({frame: layer.frame, name: "ImageMask_" + layer.name});
        mask.moveBackward();
        mask.group();
        // var group = artboard.newShape({frame:new sketch.Rectangle(0, 0, 100, 100), name:"Test"});
        // var layer = page.newText({alignment: NSTextAlignmentCenter, systemFontSize: 36, text:"Hello World"})
      }
    });
  } else {
    sketch.message('Nothing is selected!');
  }

  // get the artboard of given element / layer
  function getArtboard(element) {
    while(!element.isArtboard) {
      element = element.container;
    }
    return element;
  }


  // if (selectedCount == 0) {
  //   log('SketchDebug: No layers are selected.');
  // } else {
  //   log('SketchDebug: Selected layers:');
  //   for (var i = 0; i < selectedCount; i++) {
  //     var layer = selectedLayers[i];
  //     log('SketchDebug: ' + (i+1) + '. ' + layer.name());
  //     if (layer.class() == "MSBitmapLayer") {
  //       log('SketchDebug: is image')
  //       var newLayer =
  //     } else {
  //       sketch.message('Select only images!');
  //     }
  //   }
  // }

};
