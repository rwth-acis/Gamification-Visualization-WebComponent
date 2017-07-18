class GamificationVisualization extends Polymer.Element {
    static get is() {
        return "gamification-visualization";
    }
    static get properties() {
        return {
            // The URL-Endpoint of the Gamification-Framework
            backendurl: {
                type: String
            },

            // the id of the game to visualize
            gameid:  {
                type: String
            },

            // the username of the current user to use for the api calls
            memberid: {
                type: String
            },

            // The key of the access-token field in the local Storage
            accesstokenkeyname: {
                type: String
            }
        }
    }

    ready(){
        super.ready();


        //TODO removeFollowingLine in productive environment
        localStorage.setItem(this.accesstokenkeyname, "eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiYzc1ODhlZmMtZjgzMS00ZTMxLTkyOGUtMGY0NmE5MWZiMzExIl0sImlzcyI6Imh0dHBzOlwvXC9hcGkubGVhcm5pbmctbGF5ZXJzLmV1XC9vXC9vYXV0aDJcLyIsImV4cCI6MTUwMDM4NjMyNiwiaWF0IjoxNTAwMzgyNzI2LCJqdGkiOiI0YWU2ZjFhNi0yYzAwLTRhZjktOTJmNi0yOWZlNzI1ZjQwZTQifQ.dCDPBc9vd2XREBdfmNSCJrtiINMc1FDdxiXRji7ZekbE_w1xna9f02ykPgC35tD0IcRjswPqe0nIa9wXC589Q85xdEIA0LMFFQTgiBmaC6DzBK0bQzmg4xAdwSgraQSnJE8IO0Abj_KGsS1G-7aSNdl4D3P_CC6vw72qax9ZxGc");
        this._accessToken = localStorage.getItem(this.accesstokenkeyname);

        this.loadGamificationData();
    }

    //----------------------
    //          UI
    //----------------------

    // Gets the points, level, rank, badges, quests, leaderboard info from the Gamification backend and displays it to the user
    loadGamificationData() {
        var self = this;

        // Overview tab
        this.getMemberStatus(function(res)
        {
            self._memberStatus = res;

            // Add fetched memberStatus to overview tab
            self.shadowRoot.querySelector('#gamificationPointUnit').innerHTML = res.pointUnitName;
            self.shadowRoot.querySelector('#gamificationPoints').innerHTML = res.memberPoint;
            self.shadowRoot.querySelector('#gamificationLevel').innerHTML = res.memberLevelName;
            self.shadowRoot.querySelector('#gamificationRank').innerHTML = res.rank;

            if(res.nextLevelPoint != null) {
                var levInfo = "Next Level: " + res.nextLevelName + " at " + res.nextLevelPoint + " " + res.pointUnitName;
            }
            else {
                var levInfo = "";
            }
            self.shadowRoot.querySelector('#gamificationNextLevelInfo').innerHTML = levInfo;
        },this.errorMessage);

        // Badges tab
        this.getAllBadgesOfMember(function(res)
        {
            for(var i=0; i<res.length; i++)
            {
                var badgeReprensentation = document.createElement('p');
                var badgeImage = document.createElement('img');
                var badgeInfo = document.createElement('span');
                var innerHtml = "<br />";
                innerHtml += res[i].name + "<br />";
                innerHtml += res[i].description;
                badgeInfo.innerHTML = innerHtml;
                badgeReprensentation.appendChild(badgeImage);
                badgeReprensentation.appendChild(badgeInfo);
                self.shadowRoot.querySelector("#badges").appendChild(badgeReprensentation);

                self.getBadgeImage(self.gameid, self.memberid, res[i].id, function (imgData) {
                    badgeImage.src = imgData;
                });


            }
        }, this.errorMessage);

        // Quests tab
        //TODO

        //Leaderboard
        //TODO
    }


    // Switches the tab of the visualization. Called in the one-click event of the navigation items
    showTab(e, a) {
        //Hide all Tabs
        var i = 1;
        var curElem = this.shadowRoot.querySelector('#gamificationTab' + i);
        while (curElem != undefined)
        {
            curElem.style.display = 'none';
            this.shadowRoot.querySelector('#showTab' + i).style.fontWeight = "normal";
            i++;
            curElem = this.shadowRoot.querySelector('#gamificationTab' + i);
        }

        //Show selected tab
        var tabID = e.target.id.slice(-1);
        e.target.style.fontWeight = 'bold';
        this.shadowRoot.querySelector('#gamificationTab' + tabID).style.display = 'block';
    }

    // Displays an error message. Used as error-callback-function for the requests to the gamification framework.
    errorMessage(errorObj) {
        if(errorObj == 401) {
            alert('You are not logged in. Log in to use the gamification.')
        }
        else {
            alert('An error occured with the gamification: ' + errorObj);
        }
    }


    //----------------------
    //       Framework
    //----------------------

    // Performs the in endPointURL specified get-Request, parses the response JSON and calls either the successCallback-function or the errorCallback.
    sendRequestJsonResponse(endPointURL, successCallback, errorCallback)
    {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                var json = JSON.parse(xhttp.responseText);

                console.log("Successfully performed get request:");
                console.log(json);
                successCallback(json);
            }
            else if(this.readyState == 4)
            {
                console.log("Error performing get request:");
                console.log("Staus: " + this.status);
                errorCallback(this.status);
            }
        };
        xhttp.open("GET", this.backendurl + endPointURL, true);
        xhttp.setRequestHeader('access_token', this._accessToken);
        xhttp.send();
    }

    // gets the image for a badge. Sets the access-token in the image request.
    getBadgeImage(gameId, memberId, badgeId, successCallback) {
        var self = this;
        var oReq = new XMLHttpRequest();
        oReq.open("GET", self.backendurl + "visualization/badges/" + gameId + "/" + memberId + "/" + badgeId + "/img", true);
        oReq.setRequestHeader("access_token", self._accessToken);
        oReq.responseType = "arraybuffer";
        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                var u8 = new Uint8Array(arrayBuffer);
                var b64encoded = btoa(String.fromCharCode.apply(null, u8));
                var mimetype="image/png"; // or whatever your image mime type is
                successCallback("data:"+mimetype+";base64,"+b64encoded);
            }
        };
        oReq.send(null);
    }

    // triggers an action for the current user. If the operation was successful it calls the successCallback and passes the notification to show as parameter or undefined if there aren't any.
    triggerAction(actionId, successCallback, errorCallback)
    {
        var request = new XMLHttpRequest();
        request.open("POST", this.backendurl + "visualization/actions/" + this.gameid + "/" + actionId + "/" + this.memberid);
        request.setRequestHeader("access_token", this._accessToken);
        request.addEventListener('load', function(event) {
            if (request.status >= 200 && request.status < 300)
            {
                var json = JSON.parse(request.responseText);
                if(json.ok)
                {
                    console.log("Successfully performed get request:");
                    console.log(json);
                    alert(json.notification);
                    successCallback(json.notification);
                }
                else
                {
                    errorCallback();
                }
            }
            else
            {
                errorCallback();
            }
        });
        request.send("");
    }

    //Visualization
    getMemberStatus(successCallback, errorCallback)
    {
        var endPointURL = "visualization/status/"+this.gameid+"/"+this.memberid;
        return this.sendRequestJsonResponse(endPointURL,successCallback, errorCallback);
    }

    getAllBadgesOfMember(successCallback, errorCallback)
    {
        var endPointURL = "visualization/badges/"+this.gameid+"/"+this.memberid;
        return this.sendRequestJsonResponse(endPointURL,successCallback, errorCallback);
    }

    getAllAchievementsOfMember(successCallback, errorCallback)
    {
        var endPointURL = "visualization/achievements/"+this.gameid+"/"+this.memberid;
        return this.sendRequestJsonResponse(endPointURL,successCallback, errorCallback);
    }

    // COMPLETED, REVEALED, ALL
    getAllQuestWithStatusOfMember(questStatus, successCallback, errorCallback)
    {
        var endPointURL = "visualization/quests/"+this.gameid+"/"+this.memberid+"/status/"+questStatus;
        return this.sendRequestJsonResponse(endPointURL,successCallback, errorCallback);
    }

    getOneQuestProgressOfMember(questId, successCallback, errorCallback)
    {
        var endPointURL = "visualization/quests/"+this.gameid+"/"+this.memberid+"/progress/"+questId;
        return this.sendRequestJsonResponse(endPointURL,successCallback, errorCallback);
    }

    getOneBadgeDetailOfMember(badgeId, successCallback, errorCallback)
    {
        var endPointURL = "visualization/badges/"+this.gameid+"/"+this.memberid+"/"+badgeId;
        return this.sendRequestJsonResponse(endPointURL,successCallback, errorCallback);
    }

    getOneQuestDetailOfMember(questId, successCallback, errorCallback)
    {
        var endPointURL = "visualization/quests/"+this.gameid+"/"+this.memberid+"/"+questId;
        return this.sendRequestJsonResponse(endPointURL,successCallback, errorCallback);
    }

    getOneAchievementDetailOfMember(achievementId, successCallback, errorCallback)
    {
        var endPointURL = "visualization/achievements/"+this.gameid+"/"+this.memberid+"/"+achievementId;
        return this.sendRequestJsonResponse(endPointURL,successCallback, errorCallback);
    }
}
customElements.define(GamificationVisualization.is, GamificationVisualization);