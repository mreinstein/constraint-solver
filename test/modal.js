import constraints from '../lib/constraints.js'
import tap         from 'tap'


const layout = constraints(`

	editable window.width   weak
	editable window.height

	modal.width  <= window.width * 0.95   
	modal.height <= window.height * 0.95  required

	modal.left   == (window.width - modal.width) / 2   required
	modal.top    == (window.height - modal.height) / 2 
	playlist.width  == modal.width / 3
	playlist.height <= videoContainer.height  required
	playlist.top    == modal.top              required
	playlist.left   == modal.left + videoContainer.width

	videoContainer.width  == modal.width * 0.66
	videoContainer.height == modal.height
	videoContainer.top    == modal.top            required
   
`)


layout.suggestValue('window.width', 1024)
layout.suggestValue('window.height', 768)

layout.updateVariables()

tap.same(layout.getValues(), {
  'window.width': 1024,
  'window.height': 768,
  'modal.width': 972.8,
  'modal.height': 729.5999999999999,
  'modal.left': 25.600000000000023,
  'modal.top': 19.200000000000017,
  'playlist.width': 324.26666666666665,
  'playlist.height': 729.5999999999999,
  'videoContainer.height': 729.5999999999999,
  'playlist.top': 19.200000000000017,
  'playlist.left': 667.648,
  'videoContainer.width': 642.048,
  'videoContainer.top': 19.200000000000017
})

tap.same(layout.getValues({ roundToInt: true }), {
  'window.width': 1024,
  'window.height': 768,
  'modal.width': 973,
  'modal.height': 730,
  'modal.left': 26,
  'modal.top': 19,
  'playlist.width': 324,
  'playlist.height': 730,
  'videoContainer.height': 730,
  'playlist.top': 19,
  'playlist.left': 668,
  'videoContainer.width': 642,
  'videoContainer.top': 19
})

