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
            self.shadowRoot.querySelector('#gamificationUsername').innerHTML = self.memberid;
            self.shadowRoot.querySelector('#gamificationPointUnit').innerHTML = res.pointUnitName + ":";
            self.shadowRoot.querySelector('#gamificationPoints').innerHTML = res.memberPoint;
            self.shadowRoot.querySelector('#gamificationLevel').innerHTML = res.memberLevelName;
            self.shadowRoot.querySelector('#gamificationRank').innerHTML = res.rank;

            // Add point unit name to leaderboard table header
            self.shadowRoot.querySelector('#leaderboardPointUnitName').innerHTML = res.pointUnitName;

            if(res.nextLevelPoint != null) {
                var levInfo = "Next Level: " + res.nextLevelName + " at " + res.nextLevelPoint + " " + res.pointUnitName;
            }
            else {
                var levInfo = "";
            }
            self.shadowRoot.querySelector('#gamificationNextLevelInfo').innerHTML = levInfo;

            self.showFirstTab();
        },this.errorMessage);

        // Badges tab
        this.getAllBadgesOfMember(function(res)
        {
            for(let i=0; i<res.length; i++)
            {
                let badgeReprensentation = document.createElement('p');
                let badgeImage = document.createElement('img');
                let badgeName = document.createElement('p');
                badgeName.className = "fieldTitle";
                let badgeDesc = document.createElement('p');

                badgeName.innerHTML = res[i].name;
                badgeDesc.innerHTML = res[i].description;

                badgeReprensentation.appendChild(badgeImage);
                badgeReprensentation.appendChild(badgeName);
                badgeReprensentation.appendChild(badgeDesc);
                self.shadowRoot.querySelector("#badges").appendChild(badgeReprensentation);

                self.getBadgeImage(self.gameid, self.memberid, res[i].id, function (imgData) {
                    badgeImage.src = imgData;
                });
            }
        }, this.errorMessage);

        // Achievements tab
        this.getAllAchievementsOfMember(function (res) {
            for(let i=0; i<res.length; i++)
            {
                let div = document.createElement('div');
                div.className = "achievement";
                let achmntName = document.createElement('h4');
                achmntName.innerHTML = res[i].name;
                let achmntDesc = document.createElement('p');
                achmntDesc.innerHTML = res[i].description;
                div.appendChild(achmntName);
                div.appendChild(achmntDesc);
                self.shadowRoot.querySelector("#achievements").appendChild(div);
            }
        },this.errorMessage);

        // Quests tab
        this.getAllQuestWithStatusOfMember("REVEALED", function (res) {
            if(res != null)
            {
                for(let i=0; i<res.length; i++) {
                    let questRepresentation = document.createElement('div');
                    questRepresentation.className = "quest";
                    //Title
                    let questTitle = document.createElement('h4');
                    questTitle.innerHTML = res[i].name;
                    questRepresentation.appendChild(questTitle);
                    //Description
                    let questDesc = document.createElement('p');
                    questDesc.innerHTML = res[i].description;
                    questRepresentation.appendChild(questDesc);
                    //Actions
                    let actionsTable = document.createElement('table');
                    actionsTable.innerHTML = "<tr><th>Action</th><th>Number of executions</th><th>Completed</th></tr>";
                    questRepresentation.appendChild(actionsTable);

                    self.shadowRoot.querySelector("#quests").appendChild(questRepresentation);

                    // Load quest progress
                    self.getOneQuestProgressOfMember(res[i].id, function (res, table) {
                        for (let i = 0; i < res.actionArray.length; i++) {
                            let tr = document.createElement('tr');
                            let acNameTd = document.createElement('td');
                            let acStatusTd = document.createElement('td');
                            let acCompletedTd = document.createElement('td');

                            acNameTd.innerHTML = res.actionArray[i].action;
                            acStatusTd.innerHTML = res.actionArray[i].times + "/" + res.actionArray[i].maxTimes;
                            if (res.actionArray[i].isCompleted) {
                                acCompletedTd.innerHTML = "&#10004;";
                            } else {
                                acCompletedTd.innerHTML = "	&#10060;";
                            }

                            // Build DOM tree
                            tr.appendChild(acNameTd);
                            tr.appendChild(acStatusTd);
                            tr.appendChild(acCompletedTd);
                            actionsTable.appendChild(tr);
                        }
                    }, self.errorMessage);
                }
            }
        }, this.errorMessage);

        //Leaderboard
        this.getLocalLeaderboard(this.gameid, this.memberid, function (res) {
            for(let i=0; i<res.rows.length; i++)
            {
                let tr = document.createElement('tr');
                let rank = document.createElement('td');
                let user = document.createElement('td');
                let points = document.createElement('td');

                rank.innerHTML = res.rows[i].rank;
                user.innerHTML = res.rows[i].memberId;
                points.innerHTML = res.rows[i].pointValue;

                tr.appendChild(rank);
                tr.appendChild(user);
                tr.appendChild(points);
                self.shadowRoot.querySelector('#leaderboard').appendChild(tr);
            }
        }, this.errorMessage);
    }

    // Shows the first tab after data was loaded
    showFirstTab() {
        this.shadowRoot.querySelector('#loadingInfo').style.display = 'none';
        this.shadowRoot.querySelector('#showTab1').style.fontWeight = 'bold';
        this.shadowRoot.querySelector('#gamificationTab1').style.display = 'block';
    }


    // Switches the tab of the visualization. Called in the one-click event of the navigation items
    showTab(e, a) {
        //Hide all Tabs
        var i = 1;
        var curElem = this.shadowRoot.querySelector('#gamificationTab' + i);
        while (curElem != undefined)
        {
            curElem.style.display = 'none';
            this.shadowRoot.querySelector('#showTab' + i).style.fontWeight = "";
            i++;
            curElem = this.shadowRoot.querySelector('#gamificationTab' + i);
        }

        //Show selected tab
        var tabID = e.target.id.slice(-1);
        e.target.style.fontWeight = 'bold';
        this.shadowRoot.querySelector('#gamificationTab' + tabID).style.display = 'block';
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

    // Displays an error message. Used as error-callback-function for the requests to the gamification framework.
    errorMessage(errorObj) {
        if(errorObj == 401) {
            alert('You are not logged in. Log in to use the gamification.');
        }
        else {
            alert('An error occured with the gamification: ' + errorObj);
        }
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

    getLocalLeaderboard(gameId, memberId, successCallback, errorCallback)
    {
        var endPointURL = "visualization/leaderboard/local/" + gameId + "/" + memberId + "?current=1&rowCount=500&searchPhrase";
        return this.sendRequestJsonResponse(endPointURL, successCallback, errorCallback);
    }
}
customElements.define(GamificationVisualization.is, GamificationVisualization);