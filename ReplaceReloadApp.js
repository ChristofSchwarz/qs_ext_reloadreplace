define(["qlik", "jquery", "text!./style.css", "./functions", "./props"],
    function (qlik, $, cssContent, functions, props) {
        'use strict';

        $("<style>").html(cssContent).appendTo("head");

        return {
            definition: {
                type: "items",
                component: "accordion",
                items: {
                    settings: {
                        uses: "settings"
                    },
                    extensionSection: {
                        label: 'Extension Settings',
                        type: 'items',
                        component: 'expandable-items',
                        items: [
                            props.qrsSettings(qlik),
                            props.button1(qlik),
                            props.button2(qlik),
                            props.button3(qlik),
                            props.button4(qlik)
                        ]
                    },
					aboutSection: {
						label: 'About this extension',
						type: 'items',
                        items: props.about()
					}
                }
            },

            resize: function ($element, layout) {
                // nothing to do when only resized
                return qlik.Promise.resolve();
            },
            paint: async function ($element, layout) {

                //console.log(layout);
                var self = this;
                var ownId = this.options.id;
                var app = qlik.currApp(this);
                var global = qlik.getGlobal();
                var qrsAppInfo;
                var html = '<div class="qv-object-ReplaceReloadApp-welcome">Developer\'s Friend by '
				+ '<b style="color:#0A2C4D">data<span style="color:#F0C131;">/\\</span>bridge</b></div>'
				html += '<div id="msg_' + ownId + '" style="color:red;"></div>';
                if (layout.pCBshowIfFormula == true && layout.pShowCondition.substr(0, 1) == '=') {
                    html += '<div style="color:red;">Please edit the condition formula, press the <b><i>fx</i></b> button</div>';
                }
                if (layout.pCBkeepData == true) {
                    html += '<div id="connErr_' + ownId + '" style="color:red;display:none;">Invalid Data Connection name.</div>';
                }

                //var localEnigma = app.model.enigmaModel;
				
                var randomKey = Math.random().toString().substr(2).repeat(16).substr(0, 16);
                var httpHeader = {};
                httpHeader[layout.hdrkey] = layout.hdrval;
                httpHeader["X-Qlik-Xrfkey"] = randomKey;

                // Draw the html buttons		
				
                var renderBtn1 = layout.pCBreload;
                if (layout.pCBshowIfFormula)
                    if (layout.pShowCondition == 0) renderBtn1 = false;
                var hideBtn1 = layout.pCBhideIfPublic;

                if (renderBtn1) {
                    html += '<button id="btn1_' + ownId + '" class="lui-button qv-object-ReplaceReloadApp-ellipse" style="color:' +
                        (layout.pTxtColor1.color ? layout.pTxtColor1.color : layout.pTxtColor1) +
                        ';background-color:' + (layout.pBgColor1.color ? layout.pBgColor1.color : layout.pBgColor1) + ';' +
                        (hideBtn1 ? 'display:none' : '') + '">' + layout.pBtnLabel1 + '</button>';
                }

                var renderBtn2 = layout.pCBreplace;
                if (app.id.toUpperCase() == layout.pTargetAppId.toUpperCase()) renderBtn2 = false;
                if (renderBtn2) {
                    html += '<button id="btn2_' + ownId + '" class="lui-button qv-object-ReplaceReloadApp-ellipse" style="color:' +
                        (layout.pTxtColor2.color ? layout.pTxtColor2.color : layout.pTxtColor2) +
                        ';background-color:' + (layout.pBgColor2.color ? layout.pBgColor2.color : layout.pBgColor2) + ';">' +
                        layout.pBtnLabel2 + '</button>';
                }

                var renderBtn3 = layout.pCBstream;
                if (renderBtn3) {
                    html += '<button id="btn3_' + ownId + '" class="lui-button qv-object-ReplaceReloadApp-ellipse" style="color:' +
                        (layout.pTxtColor3.color ? layout.pTxtColor3.color : layout.pTxtColor3) +
                        ';background-color:' + (layout.pBgColor3.color ? layout.pBgColor3.color : layout.pBgColor3) + ';">' +
                        layout.pBtnLabel3 + '</button>';
                }

                var renderBtn4 = layout.pCBexport;
                if (renderBtn4) {
                    html += '<button id="btn4_' + ownId + '" class="lui-button qv-object-ReplaceReloadApp-ellipse" style="color:' +
                        (layout.pTxtColor4.color ? layout.pTxtColor4.color : layout.pTxtColor4) +
                        ';background-color:' + (layout.pBgColor4.color ? layout.pBgColor4.color : layout.pBgColor4) + ';">' +
                        layout.pBtnLabel4 + '</button>';
                }

                $element.html(html);

                // Functionality of RELOAD button

                $element.find("#btn1_" + ownId).on("click", function () {
                    console.log('Button1 clicked.');
                    functions.btnClick1($, ownId, app, layout);
                });

                // Functionality of REPLACE button

                $element.find("#btn2_" + ownId).on("click", async function () {
                    console.log("Button2 clicked.");
                    functions.btnClick2($, ownId, app, layout, global);
                });

                // Functionality of STREAM button

                $element.find("#btn3_" + ownId).on("click", async function () {
                    functions.btnClick3($, ownId, app, layout);
                });


                // Functionality of EXPORT button

                $element.find("#btn4_" + ownId).on("click", function () {
                    console.log('Button4 clicked.');
                    functions.btnClick4($, ownId, app, layout);
                });


                // Checking the Extension Settings about Virtual Proxy / QRS API access

                $.ajax({
                    method: 'GET',
                    url: '/' + layout.vproxy + '/qrs/app?filter=id eq ' + app.id + '&xrfkey=' + randomKey,
                    headers: httpHeader
                }).done(function (response, textStatus, xhr) {
                    //console.log('Response of: '+reqSettings.method+' '+reqSettings.url+':', response, textStatus, xhr);				
                    if (xhr.status == 200 && xhr.responseText.length > 2) {
                        $('#msg_' + ownId).text('');  // clear the message

                        qrsAppInfo = xhr.responseJSON;
                        //console.log('Info about own app from QRS: ',qrsAppInfo);
                        // if this is a published app and if the option is to show the button also published apps, disable the display:none
                        if (qrsAppInfo[0])
                            if (layout.pCBhideIfPublic)
                                if (qrsAppInfo[0].stream == null) {
                                    $("#btn1_" + ownId).css('display', '');
                                };
                        if (layout.pCBkeepData == true) {
                            $.ajax({
                                method: 'GET',
                                url: '/' + layout.vproxy + "/qrs/dataconnection/count?filter=name eq '" + layout.pDataConn + "'&xrfkey=" + randomKey,
                                headers: httpHeader
                            }).done(function (response, textStatus, xhr) {
                                if (response.value != 1) $("#connErr_" + ownId).css('display', ''); // unhide the connection ErrorMsg
                            });

                        }
                    } else {
                        $('#msg_' + ownId).text('Invalid Vproxy settings.');
                    }
                }).catch(function (err) {
                    $('#msg_' + ownId).text('Invalid Vproxy settings.');
                });

                return qlik.Promise.resolve();
            }
        };
    });