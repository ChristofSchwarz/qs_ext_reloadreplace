# Qlik Sense Extension: Reload and Replace a published app

Simple extension, that 
 * allows a developer to refresh an already published app with a new design from a copy of this app (standard process)
 * allows to reload the app without going through script editor (using QRS API - also works when app is already published)
 
## Virtual Proxy Setup

Since both buttons interact with Qlik's QRS API, it is necessary to setup a virtual proxy first, so that the extension can 
authorize against it. It is using Header Authentication. Log in to your server as Root Admin and go to the QMC page
`/qmc/virtualproxies`. Set up the following:

![screenshot](https://raw.githubusercontent.com/ChristofSchwarz/pics/master/vproxyext.png "screenshot")

Do not forget to set the "Load balancing node" and - after you saved the new virtual proxy - to link it to the associated Central Proxy. 

The settings (1), (2) and (3) from above settings are needed as settings in the extension:




## Reload Button

## Replace Button

### Data Connection to the App Folder

If you plan to use the option *Keep data + script of target app* you need to create and define a data connection, that points to the 
Qlik Sense shared app folder. 

![screenshot](https://raw.githubusercontent.com/ChristofSchwarz/pics/master/cbkeepdata.png "screenshot")

Create a data connection in the load editor. Remember the exact title of the data connection (this includes your user id in brackets)

![screenshot](https://raw.githubusercontent.com/ChristofSchwarz/pics/master/dataconn.png "screenshot")

Note: This data connection is needed, because the source app will be BINARY loaded with the data model of the target app 
before replacing its design+data. After this is done, the source app's data will be reverted to the data you had when you clicked 
the button. 




