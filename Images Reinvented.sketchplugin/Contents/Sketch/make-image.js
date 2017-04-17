
function fillImage(context) {
  resizeLayer(context, "fillImage")
}

function fitImage(context) {
  resizeLayer(context, "fitImage")
}

function resizeMask(context) {
  resizeLayer(context, "resizeMask")
}


function resizeLayer(context, method) {

  // log('SketchDebug: Running')

  var document = context.document
  var page = document.currentPage()
  var selection = context.selection
  var selectionCount = selection.length

  // log('SketchDebug: ' + selectionCount)

  if (selectionCount > 0) {
    for (var i = 0; i < selectionCount; i++) {
      var layer = selection.objectAtIndex(i)
      var artboard = layer.parentArtboard()
      var placeInto = (artboard) ? artboard : page

      // log('SketchDebug: ' + layer.name() + " is selected, type is " + layer.className() + ", placeInto is " + placeInto.name())

      var group = getGroup(layer)

      if (!group) {
        document.showMessage('Please select a valid image group!');
      } else {

        // get mask and image layers
        var groupChildren = group.layers()
        var maskLayer = groupChildren[0]
        var imageLayer = groupChildren[1]

        // temp layer to get image dimension
        var imageLayerFills = imageLayer.style().fills()
        var image = null
        for (var i = 0; i < imageLayerFills.length; i++) {
          if (imageLayerFills[i].image() && imageLayerFills[i].fillType() == 4) {
            image = imageLayerFills[i].image()
            break // stop for loop at first image
          }
        }
        var tempLayer = MSBitmapLayer.new()
        tempLayer.setImage(image)
        tempLayer.frame().size = tempLayer.NSImage().size()

        // image dimension
        var imageWidth = tempLayer.frame().width()
        var imageHeight = tempLayer.frame().height()

        // mask dimension
        var maskLayerWidth = maskLayer.frame().width()
        var maskLayerHeight = maskLayer.frame().height()

        // ratios
        var imageRatio = imageWidth / imageHeight
        var maskLayerRatio = maskLayerWidth / maskLayerHeight

        var newImageLayerWidth = 0
        var newImageLayerHeight = 0
        var newImageLayerX = 0
        var newImageLayerY = 0

        if (method == "fitImage") {
          if (imageRatio < maskLayerRatio) {
            newImageLayerHeight = maskLayerHeight
            newImageLayerWidth = Math.round(maskLayerHeight * imageRatio)
          } else {
            newImageLayerWidth = maskLayerWidth
            newImageLayerHeight = Math.round(maskLayerWidth / imageRatio)
          }
          resizeImageLayer()
        }

        if (method == "fillImage") {
          if (imageRatio < maskLayerRatio) {
            newImageLayerWidth = maskLayerWidth
            newImageLayerHeight = Math.round(maskLayerWidth / imageRatio)
          } else {
            newImageLayerHeight = maskLayerHeight
            newImageLayerWidth = Math.round(maskLayerHeight * imageRatio)
          }
          resizeImageLayer()
        }

        function resizeImageLayer() {
          newImageLayerX = maskLayer.frame().x() + ( (maskLayerWidth - newImageLayerWidth) / 2 )
          newImageLayerY = maskLayer.frame().y() + ( (maskLayerHeight - newImageLayerHeight) / 2 )

          imageLayer.setConstrainProportions(false)
          imageLayer.frame().setWidth(newImageLayerWidth)
          imageLayer.frame().setHeight(newImageLayerHeight)
          imageLayer.frame().setX(newImageLayerX)
          imageLayer.frame().setY(newImageLayerY)
          imageLayer.setConstrainProportions(true)
        }

        if (method == "resizeMask") {
          maskLayer.setConstrainProportions(false)
          maskLayer.frame().setWidth(imageLayer.frame().width())
          maskLayer.frame().setHeight(imageLayer.frame().height())
          maskLayer.frame().setX(imageLayer.frame().x())
          maskLayer.frame().setY(imageLayer.frame().y())
          // resize group to childrens dimension
          group.setConstrainProportions(false)
          group.resizeToFitChildrenWithOption(1)
          group.setConstrainProportions(true)
        }


      }

    }
  } else {
    document.showMessage('Nothing is selected!')
  }

  function getGroup(layer) {

    var group = null;

    // get group
    if (layer.className() == "MSLayerGroup") {
      group = layer
    } else if (layer.className() == "MSShapeGroup") {
      var tempGroup = layer.parentGroup()
      if (tempGroup.className() == "MSLayerGroup" ) {
        group = tempGroup
      }
    }

    // check if group is valid
    if (group) {
      var children = group.layers()
      var valid = true
      // test sublayer count
      if (children.length != 2) {
        valid = false
      }

      // test mask layer
      var mask = children[0]
      if ( (mask.className() != "MSShapeGroup") || (mask.hasClippingMask() != 1) ) {
        valid = false
      }

      // test image layer
      var image = children[1]
      var imageFills = image.style().fills()
      var imageFillsValid = false
      if ( (image.className() != "MSShapeGroup") ) {
        valid = false
      }
      for (var i = 0; i < imageFills.length; i++) {
        if (imageFills[i].image() && imageFills[i].fillType() == 4) {
          imageFillsValid = true
        }
      }
      if (imageFillsValid == false) {
        valid = false
      }

      // mark group invalid
      if (!valid) {
        group = null
      }

    }

    return group
  }

}


function createImageGroup(context) {

  // log('SketchDebug: Running')

  var document = context.document
  var page = document.currentPage()
  var selection = context.selection
  var selectionCount = selection.length

  // log('SketchDebug: ' + selectionCount)

  if (selectionCount > 0) {
    for (var i = 0; i < selectionCount; i++) {
      var layer = selection.objectAtIndex(i)
      var artboard = layer.parentArtboard()
      var placeInto = (artboard) ? artboard : page

      // log('SketchDebug: ' + layer.name() + " is selected, type is " + layer.className() + ", placeInto is " + placeInto.name())

      if (layer.className() != "MSBitmapLayer") {
        document.showMessage('Please select only images! ' + layer.name() + ' is ' + layer.className());
      } else {

        // get layers frame
        var layerFrame = layer.frame()

        // create group
        var groupLayer = MSLayerGroup.new()
        groupLayer.setName(layer.name())

        // create layer rect
        var layerRect = NSMakeRect(layerFrame.x(), layerFrame.y(), layerFrame.width(), layerFrame.height())

        // create underlying mask
        var maskLayer = MSShapeGroup.shapeWithRect(layerRect)
        maskLayer.setName("mask")
        maskLayer.setHasClippingMask(1)
        maskLayer.style().addStylePartOfType(0)
        var maskLayerStyle = maskLayer.style().fills().firstObject()
        maskLayerStyle.setFillType(0)
        groupLayer.addLayer(maskLayer)

        // create layer with image as fill
        var imageLayer = MSShapeGroup.shapeWithRect(layerRect)
        imageLayer.setName("image")
        imageLayer.setConstrainProportions(true)
        imageLayer.style().addStylePartOfType(0)
        var imageLayerStyle = imageLayer.style().fills().firstObject()
        imageLayerStyle.setFillType(4)
        imageLayerStyle.setPatternFillType(1)
        imageLayerStyle.setImage(layer.image())
        groupLayer.addLayer(imageLayer)

        // add group with layers to placeInto
        placeInto.addLayer(groupLayer)

        // resize group to childrens dimension
        groupLayer.resizeToFitChildrenWithOption(1)
        groupLayer.setConstrainProportions(true)

        // remove original image layer
        layer.removeFromParent()

      }
    }
  } else {
    document.showMessage('Nothing is selected!')
  }


};
