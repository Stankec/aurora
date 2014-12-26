// Configuration
var socket = null;
var $availableAnimationsTable = null;
var $activeAnimationsList = null;

// Do stuff
$(document).ready(function () {
  // Pre setup
  // Initialize socket
  socket = io();
  attachSocketListeners(socket);
  // Setup global variables
  $availableAnimationsTable = $('table.animations.available tbody');
  $activeAnimationsList = $('.animations.active');
  // Post setup
  reoreableAnimations($activeAnimationsList);
  attachListeners();
  getAnimations();
});

// Functions
function attachSocketListeners(aSocket) {
  console.log('Attaching socket listeners')
  aSocket.on('animations_update', function(json){
    console.log('animations_update: ' + JSON.stringify(json))
    if (json.forceUpdate || json.sync) {
      getAnimations();
    } else {
      if (json.added) {
        for (var i = json.added.length - 1; i >= 0; i--) {
          addAnimation(json.added[i].id, true);
        };
      }
      if (json.removed) {
        for (var i = json.removed.length - 1; i >= 0; i--) {
          removeAnimation(json.removed[i].id, true);
        };
      }
      if (json.order) {
        $.each(json.order, function(index, animationID) {
          $animationView = $('#'+ animationID);
          if ($animationView.length !== 0) {
            $animationParent = $animationView.parent();
            if ($animationParent.length !== 0) {
              $animationView.remove().appendTo($animationParent);
            }
          }
        });
      }
    }
  });
  aSocket.on('animation_update', function(json){
    console.log('animation_update: ' + JSON.stringify(json));
    window[json.id]["options"](json.options);
  });
}

function attachListeners() {
  $('body').on('click', 'button.animation.add', function(e) {
    addAnimation($(this).data('id'));
  });
  $('body').on('click', 'button.animation.remove', function(e) {
    removeAnimation($(this).data('id'));
  });
}

function getAnimations() {
  $.ajax({
    url: '/api/animations'
  }).success(function(json){
    if (($availableAnimationsTable.length == 0) || !json.available) return;
    $availableAnimationsTable.html('');
    for (var i = json.available.length - 1; i >= 0; i--) {
      $availableAnimationsTable.append("<tr class='animation "+ json.available[i].id +"'><td>"+ json.available[i].name +"</td><td><button class='btn btn-primary btn-block animation add' data-id='"+ json.available[i].id +"'>Add <i class='fa fa-plus'></i></button></td></tr>")
    };
    $activeAnimationsList.html('');
    for (var i = json.active.length - 1; i >= 0; i--) {
      addAnimation(json.active[i].id, true)
    };
  });
}

function addAnimation(animationID, silent) {
  silent = typeof silent !== 'undefined' ? silent : false;
  $.ajax({
    url: '/api/animations/'+ animationID +'/view'
  }).success(function(json){
    var $availableAnimationRow = $availableAnimationsTable.find('tr.animation.'+ animationID);
    if ($availableAnimationRow.length == 0) return;
    $availableAnimationRow.hide('fast');
    var $animationView = $('<div class="well animation '+ json.id +'" id="'+ json.id +'">'+ json.template +'<button class="btn btn-danger btn-block animation remove" data-id="'+ json.id +'">Remove <i class="fa fa-times"></i></button><div class="clearfix"></div></div>');
    $activeAnimationsList.append($animationView);
    // Set current options
    $.ajax({
      url: '/api/animations/'+ animationID
    }).success(function(json){
      window[json.id]["options"](json.options);
    });
    // Announce
    if (!silent) {
      console.log('animations_update -> ADD: ' + animationID);
      socket.emit('animations_update',
        {
          added: [
            { id: json.id }
          ]
        }
      );
    }
  });
}

function removeAnimation(animationID, silent) {
  silent = typeof silent !== 'undefined' ? silent : false;
  $availableAnimationsTable.find('tr.animation.'+ animationID).show('fast');
  $activeAnimationsList.find('.well.animation.'+ animationID).remove();
  if (!silent) {
    socket.emit('animations_update',
      {
        removed: [
          { id: animationID }
        ]
      }
    );
  }
}

function reoreableAnimations(object, childSelector) {
  object = typeof object !== 'undefined' ? object : $('div[class^=col].animations');
  childSelector = typeof childSelector !== 'undefined' ? childSelector : '> .animation';

  object.sortable(
    {
      items: childSelector,
      forcePlaceholderSize: true,
      placeholder: 'reordering',
      handle: '.handle',
      update: function(event, ui) {
        socket.emit('animations_update',
          {
            order: $(this).sortable( "toArray" )
          }
        );
      }
    }
  );
}
