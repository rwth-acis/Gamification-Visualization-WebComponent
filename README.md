Gamification-Visualization-WebComponent
================================

Polymer Web Component port of https://github.com/rwth-acis/Gamification-Visualization-Frontend. During the development it was necessary to switch back to polymer 1.9.
A Polymer 2.0 component can be found in the branch "polymer2.0".

Requirements
----------
Make sure node.js, polymer and bower are installed.

Use Web Component
----------
Import the Component in your sourcecode and add the following DOM-element:
```
<gamification-visualization backendurl="http://137.226.58.16:8086/"
                                gameid="testspiel"
                                memberid="gottschlich"
                                accesstokenkeyname="openidconnect-signin-token">
</gamification-visualization>
```

The attribute "backendurl" should contain the url of your Gamification-Framework backend server.
(See https://github.com/rwth-acis/Gamification-Framework).

"gameid" is the id of the game in the Gamification Framework to visualize.

"memberid" is the id of the user currently logged in. It is used as memberId for the backend api calls.

"accesstokenkeyname" is the name of the field in the local storage where the access token for the authorization of the current user is saved.

Run Web Application
----------
The file index.html contains a example integration of the component into an application. To run it open a console at this path and call
```
bower install
polymer serve
```
Open the url returned in the console in your browser.