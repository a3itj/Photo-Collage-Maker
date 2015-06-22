$(function() {
    "use strict";
    function getNumber(value) {
        var n = parseInt(value);

        return n == null || isNaN(n) ? 0 : n;
    }

    function resizeImage(target) {
        var $container = $(target),
            orig_src = new Image(),
            image_target = $container.find('img')[0],
            savedState = {},
            resize_canvas = document.createElement('canvas');

        orig_src.src = $(image_target).attr('src');


        // Add events
        $container.on('mousedown', '.resize', startResize);
        //$container.on('mousedown', 'img', startMoving);

        function startResize(e) {
            e.preventDefault();
            e.stopPropagation();
            saveContainerState(e);
            $(document).on('mousemove', resizing);
            $(document).on('mouseup', endResize);
        };

        function endResize(e) {
            e.preventDefault();
            $(document).off('mouseup', endResize);
            $(document).off('mousemove', resizing);
        };

        function resizing(e) {
            var width,
                height,
                left,
                top,
                offset = $container.offset(),
                xpos = (e.clientX) + $(window).scrollLeft(),
                ypos = (e.clientY) + $(window).scrollTop(),
                $target = $(savedState.evnt.target),
                angle = savedState.angle,
                dx, dy;

            // Position image differently depending on the corner dragged
            var action = $target.attr("action");
            if(action){
            switch(action) {
                case 'se':
                    width = xpos - savedState.left;
                    height = ypos - savedState.top;
                    left = savedState.left;
                    top = savedState.top;
                    break;
                case 'sw':
                    width = savedState.width - (xpos - savedState.left);
                    height = ypos - savedState.top;
                    left = xpos;
                    top = savedState.top;
                    break;
                case 's':
                    width = savedState.width;
                    height = ypos - savedState.top;
                    left = savedState.left;
                    top = savedState.top;
                    break;
                case 'nw':
                    width = savedState.width - (xpos - savedState.left);
                    height = savedState.height - (ypos - savedState.top);
                    left = xpos;
                    top = ypos;
                    break;
                case 'w':
                    width = savedState.width - (xpos - savedState.left);
                    height = savedState.height;
                    left = xpos;
                    top = savedState.top;
                    break;
                case 'ne':
                    width = xpos - savedState.left;
                    height = savedState.height - (ypos - savedState.top);
                    left = savedState.left;
                    top = ypos;
                    break;
                case 'e':
                    width = xpos - savedState.left;
                    height = savedState.height;
                    left = savedState.left;
                    top = savedState.top;
                    break;
                case 'r':
                    width = savedState.width;
                    height = savedState.height;
                    dx = parseInt(xpos - offsetX) - savedState.width;
                    dy = parseInt(ypos - offsetY) - savedState.height;
                    angle = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
                    break;
            }
            var throttled = _.throttle(function(e) {
                resizeImage(width, height, angle);
                // Without this Firefox will not re-calculate the the image dimensions until drag end
                $container.offset({
                    'left': left,
                    'top': top
                });
            }, 250)

            throttled();
            }
        }

        function resizeImage(width, height, angle) {
            var r = angle || 0;
            resize_canvas.width = width;
            resize_canvas.height = height;
            var ctx = resize_canvas.getContext('2d')
            ctx.drawImage(orig_src, 0, 0, width, height);

            $(image_target).attr('src', resize_canvas.toDataURL("image/png"));
            $(image_target).closest('.resize-container').css({
                '-webkit-transform': 'rotate(' + r * 10 + 'deg)',
                'transform': 'rotate(' + r + 'deg)'
            });
        };

        function startMoving(e) {
            e.preventDefault();
            e.stopPropagation();
            saveContainerState(e);
            $(document).on('mousemove', moving);
            $(document).on('mouseup', endMoving);
        };

        function endMoving(e) {
            e.preventDefault();
            $(document).off('mouseup', endMoving);
            $(document).off('mousemove', moving);
        };

        function moving(e) {
            var mouse = {};
            e.preventDefault();
            e.stopPropagation();

            xpos = (e.clientX || e.pageX || touches[0].clientX) + $(window).scrollLeft();
            ypos = (e.clientY || e.pageY || touches[0].clientY) + $(window).scrollTop();
            $container.offset({
                'left': xpos - (savedState.mouse_x - savedState.left),
                'top': ypos - (savedState.mouse_y - savedState.top)
            });
        };

        function getRotationDegrees(obj) {
            var matrix = obj.css("-webkit-transform") ||
                obj.css("-moz-transform") ||
                obj.css("-ms-transform") ||
                obj.css("-o-transform") ||
                obj.css("transform");
            if (matrix !== 'none') {
                var values = matrix.split('(')[1].split(')')[0].split(',');
                var a = values[0];
                var b = values[1];
                var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            } else {
                var angle = 0;
            }
            return (angle < 0) ? angle + 360 : angle;
        }

        function saveContainerState(e) {
            // Save the initial event details and container state
            savedState.width = $container.width();
            savedState.height = $container.height();
            savedState.left = $container.offset().left;
            savedState.top = $container.offset().top;
            savedState.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
            savedState.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();
            savedState.evnt = e;
            savedState.angle = getRotationDegrees($container);
        };

    }

    function drawImage(event) {
        event.preventDefault();

        var data = event.originalEvent.dataTransfer;
        var files = data ? data.files : event.target.files;
        _.forEach(files, function(file) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            var $reader = $(reader);


            $reader.on("loadend", function(e, file) {
                var result = this.result;
                var fileCont = $("<img/>");

                fileCont.attr('id', "img-" + id++);
                fileCont.attr('file', file);
                fileCont.attr('src', result);
                fileCont.attr('draggable', true);

                thumbNailsCont.append(fileCont);
            });
        })
        event.stopPropagation();
    }
    if (window.FileReader) {
        var dropCont = $("#dropFile");
        var thumbNailsCont = $("#thumbNails");
        var workspace = $("#workspace");
        var id = 0;
        var startX = 0; // mouse starting positions
        var startY = 0;
        var offsetX = 0; // current element offset
        var offsetY = 0;
        var dragElement = null; // current drag element
        var jDoc = $(document);
        var fileInput = $('#fileUpload')

        dropCont.click(function() {
            fileInput.trigger('click');
        });

        fileInput.on("change", drawImage);

        dropCont.on("dragover", function(event) {
            event.preventDefault();
        });
        dropCont.on("dragenter", function(event) {
            event.preventDefault();
        });

        dropCont.on("drop", drawImage);

        thumbNailsCont.on("dragstart", function(event) {
            var tarobj = event.target.nodeName;
            if (tarobj == "IMG")
                event.originalEvent.dataTransfer.setData("text", $(event.target).attr('id'));
        });


        jDoc.keydown(function(e){
            if(e.keyCode === 46 || e.keyCode === 8){
                $('.selected').remove();

            }
        })


        workspace.on("dragover", function(event) {
            event.preventDefault();
        });
        workspace.on("dragenter", function(event) {
            event.preventDefault();
        });
        workspace.on("drop", function(event) {
            event.preventDefault();
            var id = event.originalEvent.dataTransfer.getData("text")
            var data = $("#" + id);
            var cloned = data.clone();
            cloned.attr(id, "cloned-" + id);
            //data.addClass("");
            workspace.append(cloned);
            $(cloned).wrap('<div class="resize-container drag pos-abs" id="resizeContainer-' + id + '"></div>')
                .before('<span class="resize rotate" action="r"></span>')
                .before('<span class="resize resize-nw" action="nw"></span>')
                .before('<span class="resize resize-w" action="w"></span>')
                .before('<span class="resize resize-ne" action="ne"></span>')
                .before('<span class="resize resize-e" action="e"></span>')
                .after('<span class="resize resize-se" action="se"></span>')
                .after('<span class="resize resize-sw" action="sw"></span>')
                .after('<span class="resize resize-s" action="s"></span>');

        });


        workspace.on("dragstart", function(event) {
            var target = $(event.target).closest(".drag");

            if (target.length) {
                dragElement = target;
                // mouse position
                startX = event.originalEvent.clientX;
                startY = event.originalEvent.clientY;
                // clicked element's position
                offsetX = getNumber(dragElement.css("left"));
                offsetY = getNumber(dragElement.css("top"));
                event.originalEvent.dataTransfer.setData("text/plain", +(offsetX - startX) + ',' + (+(offsetY - startY)));
            }

        });

        workspace.on("dragover", function(event) {
            event.preventDefault();
            return false;
        });

        workspace.click(function(e) {
            workspace.find(".resize-container.selected").removeClass('selected');
            var tar = $(e.target).closest('.resize-container');
            if (tar.length) {
                tar.addClass("selected");
                resizeImage(tar[0])
            }
        });

        workspace.on("drop", function(event) {
            var offset = event.originalEvent.dataTransfer.getData("text/plain").split(',');
            var target = dragElement;
            if (!target) return;
            var left = (event.originalEvent.clientX + parseInt(offset[0], 10)) + 'px';
            var top = (event.originalEvent.clientY + parseInt(offset[1], 10)) + 'px';
            target.css({
                "left": left,
                "top": top
            });
            event.preventDefault();
            return false;

        });

    } else {
        alert("your browser does not support file reader API");
    }

});