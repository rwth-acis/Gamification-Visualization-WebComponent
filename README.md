Gamification-Action-Trigger
================================

WebComponent which receives the action trigger event, passes it to the gamification backend and shows the action notification if there is any.

Requirements
----------
Make sure node.js, polymer and bower are installed.

Use Web Component
----------
Import the Component in your sourcecode and add the following DOM-element:
```
<gamification-action-trigger backendurl="http://137.226.58.16:8086/"
                                gameid="testspiel"
                                memberid="gottschlich"
                                accesstokenkeyname="openidconnect-signin-token">
</gamification-action-trigger>
```

The attribute "backendurl" should contain the url of your Gamification-Framework backend server.
(See https://github.com/rwth-acis/Gamification-Framework).

"gameid" is the id of the game in the Gamification Framework to trigger actions in.

"memberid" is the id of the user currently logged in. It is used as memberId for the backend api calls.

"accesstokenkeyname" is the name of the field in the local storage where the access token for the authorization of the current user is saved.

Trigger an action
----------
To trigger an action  just call
```
this.fire('iron-signal', {name: 'gamification', data: "IdOfAction"});
```
in any web component. IdOfAction is the id of the action in the gamification backend.