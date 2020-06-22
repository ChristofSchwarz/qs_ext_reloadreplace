
function leonardoMsg(ownId, title, detail, ok, cancel, inverse){

// This html was found on https://qlik-oss.github.io/leonardo-ui/dialog.html

	var node = document.createElement("div");       
	node.id = "msgparent_" +ownId;
	var html = 
	'  <div class="lui-modal-background"></div>'
	+'  <div class="lui-dialog' + (inverse?'  lui-dialog--inverse':'') + '" style="width: 400px;top:80px;">'
	+'    <div class="lui-dialog__header">'
	+'      <div class="lui-dialog__title">'+title+'</div>'
	+'    </div>'
	+'    <div class="lui-dialog__body">'
	+       detail
	+'    </div>'
	+'    <div class="lui-dialog__footer">';
	if (cancel) { html +=
		'  <button class="lui-button  lui-dialog__button' + (inverse?'  lui-button--inverse':'') + '" '
		+'   onclick="var elem=document.getElementById(\'msgparent_' +ownId+ '\');elem.parentNode.removeChild(elem);">'
		+    cancel	
		+' </button>'
	}
	if (ok) { html +=
		'  <button class="lui-button  lui-dialog__button  ' + (inverse?'  lui-button--inverse':'') + '" id="msgok_' + ownId + '">'
    	+    ok
		+' </button>'
	};
	html +=
	'     </div>'
	+'  </div>';
	node.innerHTML = html;
	document.getElementById("qs-page-container").append(node);
};

// Asynchronous http call using JQuery's $.ajax() function
// input from https://petetasker.com/using-async-await-jquerys-ajax

async function doAjax(commonSettings, method, url, ownId) {
    let result;
    try {	
	    var args = {...{method: method, url: url}, ...commonSettings};
		console.log(args);
        result = await $.ajax(args);
		console.log('$.ajax result', result);
		return result;
    } catch (error) {
		leonardoMsg(ownId, 'Error', error.status + ' ' + error.responseText, null, 'Close', true);
	    console.log('error', error.status + ' ' + error.responseText);
    }
}


define( ["qlik", "jquery", "text!./style.css"], function ( qlik, $, cssContent) {
	'use strict';
	$( "<style>" ).html( cssContent ).appendTo( "head" );


	var mainsection1 = {
		label: 'Extension Settings',
		type: 'items',
		component: 'expandable-items',
		items: {
			i0: {
				label: 'VProxy Access QRS API',
				type: 'items',
				items: [
					{
						 label: 'VirtualProxy',
						 type: 'string',
						 expression: 'optional',
						 ref: 'vproxy',
						 defaultValue: 'header'
					},{
						 label: 'Header-key',
						 type: 'string',
						 expression: 'optional',
						 ref: 'hdrkey',
						 defaultValue: 'user'
					},{
						 label: 'Header-value',
						 type: 'string',
						 expression: 'optional',
						 ref: 'hdrval',
						 defaultValue: 'QMI-QS-SN\\vagrant'
					},{
						 label: 'Run as',
						 type: 'string',
						 expression: 'optional',
						 ref: 'pRunAs',
						 defaultValue: 'UserDirectory=INTERNAL;UserId=sa_api'
					},{
						label: "Help",
						component: "button", 
						action: function(arg) {
							window.open('https://github.com/ChristofSchwarz/qs_ext_reloadreplace/blob/master/README.md#virtual-proxy-setup','_blank');
						}
					}
				]		    
			},
			i1: {
				label: 'Reload Button Settings',
				type: 'items',
				items: [
					{
						type: "boolean",
						defaultValue: true,
						ref: "pCBreload",
						label: "Use Reload Button"
					},{
						label: 'Reload Button Label',
						type: 'string',
						expression: 'optional',
						ref: 'pBtnLabel1',
						defaultValue: 'Reload',
						show: function(data) { return data.pCBreload == true }					 
					},{
						label: 'Hide within published apps',
						type: 'boolean',
						ref: 'pCBhideIfPublic',
						defaultValue: false,
						show: function(data) { return data.pCBreload == true }					 
					},{
						label: 'Conditional Show',
						type: 'boolean',
						ref: 'pCBshowIfFormula',
						defaultValue: false,
						show: function(data) { return data.pCBreload == true }					 
					},{
						label: 'Only show if the follwing is true:',
						type: 'string',
						component: 'textarea',
						rows: 4,
						expression: 'optional',
						ref: 'pShowCondition',
						defaultValue: "=WildMatch(OSUser(), '*QMI-QS-SN*vagrant', '...')\n" 
							+ "//put a list of users in single quotes and use format '*DIRECTORY*userid' including the asterisks",
						show: function(data) { return data.pCBreload == true && data.pCBshowIfFormula == true}					 
					},{
						label: "Text color",
						component: "color-picker",
						ref: "pTxtColor1",
						type: "object",
						//dualOutput: true,
						defaultValue: "#333333",
						show: function(data) { return data.pCBreload == true }		
					},{
						label: "Background color",
						component: "color-picker",
						ref: "pBgColor1",
						type: "object",
						defaultValue: "#ffffff",
						show: function(data) { return data.pCBreload == true }		
					}
				]
			},
			i2: {
				label: 'Replace App Button Settings',
				type: 'items',
				items: [
					{
						type: "boolean",
						defaultValue: true,
						ref: "pCBreplace",
						label: "Show Replace Button"
					},{
						label: "In the target app, the button is always hidden.",
						component: "text"
					},{
						label: 'Replace App Button Label',
						type: 'string',
						expression: 'optional',
						ref: 'pBtnLabel2',
						defaultValue: 'Replace App',
						show: function(data) { return data.pCBreplace == true }					 
					},{
						label: "Refresh this target app (id)",
						type: 'string',
						expression: 'optional',
						ref: 'pTargetAppId',
						show: function(data) { return data.pCBreplace == true }	
					},{
						label: 'Keep data + script of target app',
						type: 'boolean',
						ref: 'pCBkeepData',
						defaultValue: false,
						//show: function(data) { return false }	
						show: function(data) { return data.pCBreplace == true }					 
					},{
						label: "Data Connection to Qlik's App folder",
						type: 'string',
						ref: 'pDataConn',
						expression: 'optional',
						defaultValue: 'QlikShare_Apps (qmi-qs-sn_vagrant)',
						//show: function(data) { return false }					 
						show: function(data) { return data.pCBreplace == true && data.pCBkeepData == true }					 
					},{
						label: "Text color",
						component: "color-picker",
						ref: "pTxtColor2",
						type: "object",
						//dualOutput: true,
						defaultValue: "#333333",
						show: function(data) { return data.pCBreload == true }		
					},{
						label: "Background color",
						component: "color-picker",
						ref: "pBgColor2",
						type: "object",
						defaultValue: "#ffffff",
						show: function(data) { return data.pCBreload == true }		
					}
				]
			},
			li3: {
				label: 'About - Buy me a beer?',
				type: 'items',
				items: [
					{
						label: "By Christof Schwarz",
						component: "text"
					},{
						label: "Open on Github",
						component: "button", 
						action: function(arg) {
							window.open('https://github.com/ChristofSchwarz/qs_ext_reloadreplace','_blank');
						}
					},{
						label: "Written in my leisure time, would you ...",
						component: "text"
					},{
						label: "... buy me a beer?",
						component: "button", 
						action: function(arg) {
							window.open('https://www.leetchi.com/c/donation-for-good-source-code','_blank');
						}
					}				
				]				
			}
		}
	};



	return {
		definition: {
			type: "items",
			component: "accordion",
			items: {
				settings: {
					uses: "settings"
				},
				mysection: mainsection1
			}
		},
// https://www.leetchi.com/c/donation-for-good-source-code;

		paint: function ( $element, layout ) {
		    console.log(layout);
			var self = this;
			var ownId = this.options.id;
			var app = qlik.currApp(this);
			var global = qlik.getGlobal();
			var qrsAppInfo;
			var html = '<div id="pop_'+ownId+'" style="color:red;"></div>';
			if (layout.pCBshowIfFormula == true && layout.pShowCondition.substr(0,1) == '=') {
				html += '<div style="color:red;">Please edit the condition formula, press the <b><i>fx</i></b> button</div>';
			} 
			if (layout.pCBkeepData ==true) html += '<div id="conn_' + ownId + '" style="color:red;display:none;">Invalid Data Connection name.</div>';
			var localEnigma = app.model.enigmaModel;
			//console.log('localEnigma',localEnigma);
			var randomKey = Math.random().toString().substr(2).repeat(16).substr(0,16);
			var commonReqSettings = {
				//async: true,
				//crossDomain: false,
				timeout: 0,
				headers: {
					"X-Qlik-Xrfkey": randomKey,
				}
			};
			if (layout.pRunAs.length > 0) commonReqSettings.headers["X-Qlik-User"] = layout.pRunAs;
			commonReqSettings.headers[layout.hdrkey] = layout.hdrval;


			var reqSettings = {...commonReqSettings, ...{
			  method: 'GET',
			  url: '/' + layout.vproxy + '/qrs/app?filter=id%20eq%20' + app.id + '&xrfkey=' + randomKey,
			}};



   // Draw the html buttons			
			var renderBtn1 = layout.pCBreload;
			if (layout.pCBshowIfFormula) if (layout.pShowCondition == 0) renderBtn1 = false; 
			var hideBtn1 = layout.pCBhideIfPublic;
			
			if (renderBtn1) {
				html += '<button id="btn1_' +ownId + '" class="lui-button" style="margin-bottom:4px;color:' 
				+ (layout.pTxtColor1.color ? layout.pTxtColor1.color : layout.pTxtColor1) 
				+ ';background-color:' + (layout.pBgColor1.color ? layout.pBgColor1.color : layout.pBgColor1) + ';' 
				+ (hideBtn1?'display:none':'') + '">' + layout.pBtnLabel1 + '</button>';
			}

            var renderBtn2 = layout.pCBreplace;
			if (app.id.toUpperCase() == layout.pTargetAppId.toUpperCase()) renderBtn2 = false;
			if (renderBtn2) {
				html += '<button id="btn2_' +ownId + '" class="lui-button" style="margin-bottom:4px;color:' 
				+ (layout.pTxtColor2.color ? layout.pTxtColor2.color : layout.pTxtColor2) 
				+ ';background-color:' + (layout.pBgColor2.color ? layout.pBgColor2.color : layout.pBgColor2) + ';">' 
				+ layout.pBtnLabel2 + '</button>';
			}

			$element.html( html );


	// Preflight QRS check
	
			$.ajax({...{method: 'GET', url: '/' + layout.vproxy + '/qrs/app?filter=id eq ' + app.id + '&xrfkey=' + randomKey}, ...commonReqSettings})
			.done(function (response, textStatus, xhr) {
				//console.log('Response of: '+reqSettings.method+' '+reqSettings.url+':', response, textStatus, xhr);				
				if (xhr.status == 200 && xhr.responseText.length > 2) {
					$('#pop_'+ownId).text('');
					qrsAppInfo = xhr.responseJSON;
					//console.log('Info about own app from QRS: ',qrsAppInfo);
					// if this is a published app and if the option is to show the button also published apps, disable the display:none
					if (qrsAppInfo[0]) if (layout.pCBhideIfPublic) if (qrsAppInfo[0].stream == null) {
						$("#btn1_"+ownId).css('display','');
					};
					if (layout.pCBkeepData ==true) {
						$.ajax({...{method: 'GET', url: '/' + layout.vproxy + "/qrs/dataconnection/count?filter=name eq '" + layout.pDataConn + "'&xrfkey=" + randomKey}, ...commonReqSettings})
						.done(function (response, textStatus, xhr) {
							if(response.value != 1) $("#conn_"+ownId).css('display','');
						});
					}
				} else {
					$('#pop_'+ownId).text('Invalid Vproxy settings.');
				}
			}).catch(function(err){
				$('#pop_'+ownId).text('Invalid Vproxy settings.');
			});	
			

	// Functionality of RELOAD button

			$element.find("#btn1_"+ownId).on("click", async function () {
				$('#btn1_' +ownId).text('Reloading...').prop('disabled',true);
				try {
					var res1 = await doAjax(commonReqSettings, 'POST', '/' + layout.vproxy + '/qrs/app/' + app.id + '/reload?xrfkey=' + randomKey, ownId);
					console.log('res1 of /reload:', res1);
					setTimeout(function() {
						$('#btn1_'+ownId).text(layout.pBtnLabel1).prop('disabled',false);
					}, 2000);
				}	
				catch(error) {
					leonardoMsg(ownId, 'Error', error, null, 'Close', true);
				}				
			});

	// Functionality of REPLACE button

			$element.find("#btn2_"+ownId).on("click", async function () {
			    

				var targetAppInfo = await doAjax(commonReqSettings, 'GET', '/' + layout.vproxy + '/qrs/app/full?filter=id%20eq%20' + layout.pTargetAppId + '&xrfkey=' + randomKey, ownId)
				//console.log('targetAppInfo', targetAppInfo);
				if (targetAppInfo.length == 0) {
					return leonardoMsg(ownId, 'Error', 'Invalid target app id.', null, 'Close', true);
				}
				leonardoMsg(ownId, 'Confirm app replacement', 
					'Really want to replace design of app "' + targetAppInfo[0].name + '"?<br/>'
					+ (targetAppInfo[0].stream ? ('The app is published in stream "' + targetAppInfo[0].stream.name + '"'):'The app is not published.')
					+'<br/>Owner is: ' + targetAppInfo[0].owner.userDirectory + '\\' + targetAppInfo[0].owner.userId,
					'Ok', 'Cancel'
				);
				document.getElementById('msgok_'+ownId).addEventListener("click", async function(f){
					$("#msgparent_"+ownId).remove();
				
				
					$('#btn2_' +ownId).text('Replacing...').prop('disabled',true);
					var globalEnigma = global.session.__enigmaGlobal;
					//console.log('globalEnigma', globalEnigma);
					//var session = global.session;
					//console.log('session', session);
					try {
						if (layout.pCBkeepData) {
							// 1) copy SourceApp as CopiedApp
							$('#btn2_' +ownId).text('●○○○○○○');
							var copiedAppInfo = await doAjax(commonReqSettings, 'POST', '/' + layout.vproxy + '/qrs/app/' + app.id + '/copy?xrfkey=' + randomKey, ownId);
							console.log('1)copiedAppInfo',copiedAppInfo);
							if (copiedAppInfo == undefined) return;

							// 2) get handle on target app
							//console.log('getActiveDoc', await globalEnigma.getActiveDoc());
							$('#btn2_' +ownId).text('●●○○○○○');
							var targetApp = await globalEnigma.openDoc(layout.pTargetAppId); //, NaN, NaN, NaN, true); // true = noData 
							console.log('2)targetApp', targetApp);

							// 3) get target app's script
							var targetAppScript = await targetApp.getScript();
							console.log('3)targetAppScript', targetAppScript);

							// 4) get local app's script
							$('#btn2_' +ownId).text('●●●○○○○');
							//var sourceAppScript = await localEnigma.getScript();
							var sourceAppScript = await app.getScript();
							console.log('4)sourceAppScript', sourceAppScript);

							// 5) change local app's script to BINARY
							//var setScript1 = await localEnigma.setScript('BINARY [lib://' + layout.pDataConn + '/' + layout.pTargetAppId + '];');
							var setScript1 = await app.setScript('BINARY [lib://' + layout.pDataConn + '/' + layout.pTargetAppId + '];');
							console.log('5) setScript1', setScript1);

							// 6) reload local app with the data of the target app
							$('#btn2_' +ownId).text('●●●●○○○');
							//var reloaded1 = await localEnigma.doReload(0, false);  // false = no Partial Reload (normal full reload)
							var reloaded1 = await app.doReload(); //0, false);  // false = no Partial Reload (normal full reload)
							console.log('6)reloaded1', reloaded1);
							await app.doSave();

							// 7) change local app's script to the target app's script
							//var setScript2 = await localEnigma.setScript(targetAppScript);
							var setScript2 = await app.setScript(targetAppScript);
							console.log('7) setScript2', setScript2);

							// 8) replace target app with source app
							$('#btn2_' +ownId).text('●●●●●○○');
							var targetAppInfo = await doAjax(commonReqSettings, 'PUT', '/' + layout.vproxy + '/qrs/app/' + app.id + '/replace?app=' + layout.pTargetAppId + '&xrfkey=' + randomKey, ownId);
							console.log('8) targetAppInfo', targetAppInfo);

							// 9) change local app's script to BINARY
							$('#btn2_' +ownId).text('●●●●●●○');
							//var setScript3 = await localEnigma.setScript('BINARY [lib://' + layout.pDataConn + '/' + copiedAppInfo.id + '];');
							var setScript3 = await app.setScript('BINARY [lib://' + layout.pDataConn + '/' + copiedAppInfo.id + '];');
							console.log('9) setScript3', setScript3);

							// 10) reload local app with the BINARY content of its copy
							//var reloaded2 = await localEnigma.doReload(0, false);  // false = no Partial Reload (normal full reload)
							var reloaded2 = await app.doReload(); // 0, false);  // false = no Partial Reload (normal full reload)
							console.log('10) reloaded2', reloaded2);
							await app.doSave();

							// 11) revert local app's script to the original script;
							//var setScript4 = await localEnigma.setScript(sourceAppScript);
							var setScript4 = await app.setScript(sourceAppScript.qScript);
							console.log('11) setScript4', setScript4);

							// 12) delete the temp copy app
							$('#btn2_' +ownId).text('●●●●●●●');
							var resDelete = await doAjax(commonReqSettings, 'DELETE', '/' + layout.vproxy + '/qrs/app/' + copiedAppInfo.id + '?xrfkey=' + randomKey, ownId);
							console.log('12) resDelete', resDelete);

							$('#btn2_' +ownId).text('Done!');
							setTimeout(function() {
								$('#btn2_'+ownId).text(layout.pBtnLabel2).prop('disabled','');
							}, 1500);

						} else {
							// 8) replace target app with source app
							var targetAppInfo = await doAjax(commonReqSettings, 'PUT', '/' + layout.vproxy + '/qrs/app/' + app.id + '/replace?app=' + layout.pTargetAppId + '&xrfkey=' + randomKey, ownId);
							console.log('targetAppInfo', targetAppInfo);		
							$('#btn2_' +ownId).text('Done!');
							setTimeout(function() {
								$('#btn2_'+ownId).text(layout.pBtnLabel2).prop('disabled','');
							}, 1500);
						}
						
					}
					catch(error) {
						leonardoMsg(ownId, 'Error', error, null, 'Close', true);
					}
				});					
			});

			


			return qlik.Promise.resolve();
		}
	};
} );
