'use strict';

//global variables to hold current cursor location
var mouseX = 0;
var mouseY = 0;
document.onmousemove = function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
};
//context used for rendering notes
var renderContext = 'window';

//var to hold note curl effect array
Note.arrCurlNames = ['curl1','curl2','curl3','curl4','curl5','curl6'];

//holder array and file system functions
Note.notes = [];
Note.saveNotes = function() { localStorage.notes = JSON.stringify(Note.notes);};
Note.loadNotes = function() {
  var objArr = JSON.parse(localStorage.notes);
  for (var i = 0; i < objArr.length; i++) {
    Note.notes[i] = Object.assign(new Note(), objArr[i]);
    if (!Note.notes[i].trashed) Note.notes[i].render();
  }
};

//actions performed on unload
Note.onExit = function() {
  for (var i = 0; i < Note.notes.length; i++) if (!Note.notes[i].trashed) Note.notes[i].sfx = 'loadnote';
  Note.saveNotes();
};

function Note() {

  //the top-left corner's xy-coordinates of the format [x,y]
  this.coords = [500,200];

  //dimensions of the note in pixels
  this.height = 250;
  this.width = 250;

  //the text contents of the note
  this.title = 'My Note';
  this.contents = '';

  //object id for use with unrender function
  this.id = 'note' + Note.notes.length;

  //For use with note color stretch goal
  this.filterColor = '#ff0';

  //Number of degrees rotated (from -maxTilt to +maxTilt)
  var maxTilt = 5;
  this.tilt = (Math.random() - .5) * 2 * maxTilt;

  //indicates whether the note is invisible
  this.trashed = false;

  //if age is 'newnote', an animation will occur on render - then age will be set to an empty string.
  this.sfx = 'newnote';

  //note shadow curl randonizer
  this.curl = Note.arrCurlNames[Math.floor(Math.random() * Note.arrCurlNames.length)];

  Note.notes.push(this);

  this.unrender = function() {
    var noteEl = document.getElementById(this.id);
    noteEl.parentNode.removeChild(noteEl);
  };

  this.render = function(selector) {
    //if specified, selector will be used by querySelector to define the parent element of the note.
    //if unspecified, the <body> will be the parent element.
    var parentEl = selector || 'body';
    
    //unrender if already on screen
    if (document.getElementById(this.id)) this.unrender();

    //create Elements
    var noteEl = document.createElement('div');
    var noteGFilterEl = document.createElement('div');
    var noteFilterEl = document.createElement('div');
    var noteTitleEl = document.createElement('input');
    var noteTrashEl = document.createElement('div');
    var noteInputEl = document.createElement('textarea');
    var noteMarginTop = document.createElement('div');
    var noteMarginRight = document.createElement('div');
    var noteMarginBottom = document.createElement('div');
    var noteMarginLeft = document.createElement('div');
    var noteResizeEl = document.createElement('div');
    //color picker
    var noteSetFColorEl = document.createElement('div');
    var noteSFCYellowEl = document.createElement('div');
    var noteSFCOrangeEl = document.createElement('div');
    var noteSFCRedEl = document.createElement('div');
    var noteSFCPurpleEl = document.createElement('div');
    var noteSFCBlueEl = document.createElement('div');
    var noteSFCGreenEl = document.createElement('div');

    //set position and size for note
    noteEl.style.top = this.coords[1] + 'px';
    noteEl.style.left = this.coords[0] + 'px';
    noteEl.style.height = this.height + 'px';
    noteEl.style.width = this.width + 'px';

    //add content to note
    noteTitleEl.value = this.title;
    noteInputEl.textContent = this.contents;

    //set attributes, esp. classes to be used by styles and scripts
    noteEl.setAttribute('class', 'note ' + this.sfx + ' ' + this.curl);
    noteEl.setAttribute('id', this.id);
    noteEl.style.transform = 'rotate(' + this.tilt + 'deg)';
    noteEl.style.visibility = 'visible';
    noteGFilterEl.setAttribute('class', 'noteGFilter');
    noteFilterEl.setAttribute('class', 'noteFilter');
    noteFilterEl.style.background = this.filterColor;
    noteTitleEl.setAttribute('class', 'noteTitle');
    noteTitleEl.setAttribute('type', 'text');
    noteTitleEl.setAttribute('maxlength', '12');
    noteTrashEl.setAttribute('class', 'noteTrash');
    noteTrashEl.textContent = 'x';
    noteInputEl.setAttribute('class' ,'noteInput');
    noteMarginTop.setAttribute('class', 'noteMarginTop');
    noteMarginRight.setAttribute('class', 'noteMarginRight');
    noteMarginBottom.setAttribute('class', 'noteMarginBottom');
    noteMarginLeft.setAttribute('class', 'noteMarginLeft');
    noteResizeEl.setAttribute('class', 'noteResize');
    noteSetFColorEl.setAttribute('class', 'noteSetFColor');
    noteSFCYellowEl.style.background = 'yellow';
    noteSFCOrangeEl.style.background = 'orange';
    noteSFCRedEl.style.background = 'red';
    noteSFCPurpleEl.style.background = 'purple';
    noteSFCBlueEl.style.background = 'blue';
    noteSFCGreenEl.style.background = 'green';

    //event listeners
    noteFilterEl.addEventListener('mousedown', this.startMove.bind(this));
    noteFilterEl.addEventListener('mouseup', function() {if (renderContext === '.trashbin') { this.unrender(); this.coords = [0,0]; this.trashed = true; this.render(renderContext); } else { this.trashed = false; this.render(); }}.bind(this));
    noteTitleEl.addEventListener('change', this.save.bind(this));
    noteTitleEl.addEventListener('keyup', this.save.bind(this));
    noteTrashEl.addEventListener('click', this.trash.bind(this));
    noteTrashEl.addEventListener('click', function() { if (this.contents === 'uuddlrlrba') konami(this.id); }.bind(this));
    noteInputEl.addEventListener('change', this.save.bind(this));
    noteInputEl.addEventListener('keyup', this.save.bind(this));
    noteMarginTop.addEventListener('mousedown', this.startMove.bind(this));
    noteMarginRight.addEventListener('mousedown', this.startREWResize.bind(this));
    noteMarginBottom.addEventListener('mousedown', this.startNSResize.bind(this));
    noteMarginLeft.addEventListener('mousedown', this.startLEWResize.bind(this));
    noteResizeEl.addEventListener('mousedown', this.startNWSEResize.bind(this));
    noteSFCYellowEl.addEventListener('click', this.setfColor.bind(this,'yellow'));
    noteSFCOrangeEl.addEventListener('click', this.setfColor.bind(this,'orange'));
    noteSFCRedEl.addEventListener('click', this.setfColor.bind(this,'red'));
    noteSFCPurpleEl.addEventListener('click', this.setfColor.bind(this,'purple'));
    noteSFCBlueEl.addEventListener('click', this.setfColor.bind(this,'blue'));
    noteSFCGreenEl.addEventListener('click', this.setfColor.bind(this,'green'));
    window.addEventListener('mouseup', this.stopInterval.bind(this));
    window.addEventListener('contextmenu', this.stopInterval.bind(this));
    window.addEventListener('unload', Note.onExit);

    //build note element and attach to DOM
    document.querySelector(parentEl).appendChild(noteEl);
    noteEl.appendChild(noteGFilterEl);
    noteEl.appendChild(noteFilterEl);
    noteEl.appendChild(noteTitleEl);
    noteEl.appendChild(noteTrashEl);
    noteEl.appendChild(noteInputEl);
    noteEl.appendChild(noteMarginTop);
    noteEl.appendChild(noteMarginRight);
    noteEl.appendChild(noteMarginBottom);
    noteEl.appendChild(noteMarginLeft);
    noteEl.appendChild(noteResizeEl);
    noteEl.appendChild(noteSetFColorEl);
    noteSetFColorEl.appendChild(noteSFCYellowEl);
    noteSetFColorEl.appendChild(noteSFCOrangeEl);
    noteSetFColorEl.appendChild(noteSFCRedEl);
    noteSetFColorEl.appendChild(noteSFCPurpleEl);
    noteSetFColorEl.appendChild(noteSFCBlueEl);
    noteSetFColorEl.appendChild(noteSFCGreenEl);

    if (this.sfx) this.sfx = '';
  };

  //handles moving the note, initiated with startMove
  this.move = function(offsetX, offsetY) {
    var oldX = this.coords[0];
    var oldY = this.coords[1];
    this.coords = [mouseX - offsetX, mouseY - offsetY];

    //do not allow note to be moved to an unretrievable location
    if (this.coords[0] < 0) this.coords[0] = 0;
    if (this.coords[1] < 0) this.coords[1] = 0;
    
    if (this.coords[0]!==oldX || this.coords[1]!==oldY) this.render();
  };

  //handle resizing the note
  var minWidth = 150;
  var minHeight = 150;
  this.nwseResize = function() {
    var oldW = this.width;
    var oldH = this.height;
    this.width = mouseX - this.coords[0];
    this.height = mouseY - this.coords[1];
    if (this.width < minWidth) this.width = minWidth;
    if (this.height < minHeight) this.height = minHeight;
    if (this.width !== oldW || this.height !== oldH) this.render();
  };
  this.nsResize = function() {
    var oldH = this.height;
    this.height = mouseY - this.coords[1];
    if (this.height < minHeight) this.height = minHeight;
    if (this.height !== oldH) this.render();
  };
  this.rewResize = function() {
    var oldW = this.width;
    this.width = mouseX - this.coords[0];
    if (this.width < minWidth) this.width = minWidth;
    if (this.width !== oldW) this.render();
  };
  this.lewResize = function() {
    var oldX = this.coords[0];
    var maxX = this.coords[0] + this.width - minWidth;
    this.coords[0] = mouseX;
    if (this.coords[0] > maxX) this.coords[0] = maxX;
    this.width -= this.coords[0] - oldX;
    if (this.coords[0] !== oldX) this.render();
  };

  //intervals for move and resize functions
  var interval = 0;
  this.startMove = function(e) {
    e.preventDefault();
    if (this.trashed) {this.coords[0] = document.getElementById(this.id).getBoundingClientRect().x; this.coords[1] = document.getElementById(this.id).getBoundingClientRect().y;}
    var offsetX = mouseX - this.coords[0];
    var offsetY = mouseY - this.coords[1];
    interval = setInterval(this.move.bind(this, offsetX, offsetY), 10);
  };
  this.startNWSEResize = function(e) { e.preventDefault(); interval = setInterval(this.nwseResize.bind(this), 10); };
  this.startNSResize = function(e) { e.preventDefault(); interval = setInterval(this.nsResize.bind(this), 10); };
  this.startLEWResize = function(e) { e.preventDefault(); interval = setInterval(this.lewResize.bind(this), 10); };
  this.startREWResize = function(e) { e.preventDefault(); interval = setInterval(this.rewResize.bind(this), 10); };
  this.stopInterval = function(e) {
    if (e.type !== 'contextmenu') e.preventDefault();
    Note.saveNotes();
    clearInterval(interval);
  };

  //save contents of note before unrendering... and check for konami
  this.save = function() {
    this.title = document.getElementById(this.id).childNodes[2].value;
    this.contents = document.getElementById(this.id).childNodes[4].value;
    Note.saveNotes();
  };

  //set color of note
  this.setfColor = function(color) {
    this.filterColor = color;
    this.render();
    this.save();
  };

  //removes note from the DOM, rerenders to trashbin if trashbin is rendered.
  this.trash = function() {
    this.trashed = true;
    Note.saveNotes();
    this.sfx = 'trashing';
    this.render();
    this.sfx = 'trashed';
    setTimeout(function() {this.unrender(); if (document.querySelector('.trashbin')) {this.coords = [0,0]; this.render('.trashbin');}}.bind(this),1400);
  };

}

//Displays note as a grid of divs ("clips"), where clipCount is the number of rows and columns of clips
//Recommended clip values: 3-5 is a nice effect without too much of a performance hit
Note.prototype.clipify = function(clipCount) {
  //Remove any leftover sfx classes and get note element
  this.render();
  
  var noteEl = document.getElementById(this.id);

  //each clip's width and height as a percentage of the whole note
  var percentHW = 100 / clipCount;

  //make a copy of noteEl that has no clips in it
  var starterEl = noteEl.cloneNode(true);

  //hide noteEl - only clips will be visible
  noteEl.style.visibility = 'hidden';

  //build each clip by row and column
  for (var i = 0; i < clipCount; i++) {
    for (var j = 0; j < clipCount; j++) {
      var clip = starterEl.cloneNode(true);
      clip.classList.add('clip');
      clip.style.top = '0';
      clip.style.left = '0';
      clip.style.transform = 'rotate(0)';
      clip.style.clipPath = 'inset(' + percentHW * i + '% ' + (99 - percentHW * (j + 1)) + '% ' + (99 - percentHW * (i + 1)) + '% ' + percentHW * j + '%)';
      noteEl.appendChild(clip);
    }
  }
};

//Throws each clip in a random direction. Higher clipCount will create more individual particles, higher
//strength will create a larger explosion effect.
//Recommended strength values: 45 seems pretty explodey.
Note.prototype.explode = function(strength) {

  var noteEl = document.getElementById(this.id);
  requestAnimationFrame(function() {
    for (var i = 0; i < noteEl.childNodes.length; i++) {
      noteEl.childNodes[i].style.top = (Math.random() - .5) * 100 * strength + 'px';
      noteEl.childNodes[i].style.left = (Math.random() - .5) * 100 * strength + 'px';
    }
  });
};

//when it presses the code, precious...
function konami(id) {

  // array location of Note that called konami
  var caller = parseInt(id.substring(4));

  // clip the caller
  Note.notes[caller].clipify(5);

  // get caller's main DOM element.
  var callerNoteEl = document.getElementById(id);

  // add shake to noteEl children
  // shake applied to children so that the existing rotate transform on the noteEl won't be overwritten
  for (var i = 0; i < callerNoteEl.childNodes.length; i++)
    callerNoteEl.childNodes[i].classList.add('shake');

  //after caller shakes, clip and explode all notes. Caller is outside loop because it has already been clipified
  setTimeout(function() {
    //remove shake from noteEl children
    for (var i = 0; i < callerNoteEl.childNodes.length; i++)
      callerNoteEl.childNodes[i].classList.remove('shake');

    //clip and explode all the things
    Note.notes[caller].explode(45);
    for ( i = 0; i < Note.notes.length; i++) {
      if (i !== caller && !Note.notes[i].trashed) {
        Note.notes[i].clipify(5);
        Note.notes[i].explode(45);
        Note.notes[i].trashed = true;
      }
    }
  },1000);
}

function init() {
  if (localStorage.notes) Note.loadNotes();
}

init();
