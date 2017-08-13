Gamification-Manager
================================

WebComponent to show quest list and add/delete quests/achievements in to the gamification backend.

Requirements
----------
Make sure node.js, polymer and bower are installed.

Use Web Component
----------
Import the Component in your sourcecode and add the following DOM-element:
```
<gamification-manager backendurl="http://137.226.58.16:8086/"
                      gameid="testspiel"
                      accesstokenkeyname="openidconnect-signin-token">
</gamification-manager>
```

The attribute "backendurl" should contain the url of your Gamification-Framework backend server.
(See https://github.com/rwth-acis/Gamification-Framework).

"gameid" is the id of the game in the Gamification Framework to trigger actions in.

"accesstokenkeyname" is the name of the field in the local storage where the access token for the authorization of the current user is saved.

