class GamificationVisualization extends Polymer.Element {
    static get is() {
        return "gamification-visualization";
    }
    static get properties() {
        return {
            backendurl: {
                type: String
            }
        }
    }

    ready(){
        super.ready();
        this._gameId = 1; ///TODO---------------------------
        this._memberId = 1; ///TODO----------------------

        this.getAllSimple("users/1", function (res) {

        },function () {

        });
    }

    //----------------------
    //          UI
    //----------------------

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


    //----------------------
    //       Framework
    //----------------------
    getAllSimple(endPointURL,successCallback, errorCallback)
    {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                var json = JSON.parse(xhttp.responseText);

                console.log("Sucess performing get request:");
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
        xhttp.send();
    }

    //Visualization
    getMemberStatus(successCallback, errorCallback)
    {
        var endPointURL = "visualization/status/"+this._gameId+"/"+this._memberId;
        return this.getAllSimple(endPointURL,successCallback, errorCallback);
    }

    getAllBadgesOfMember(successCallback, errorCallback)
    {
        var endPointURL = "visualization/badges/"+this._gameId+"/"+this._memberId;
        return this.getAllSimple(endPointURL,successCallback, errorCallback);
    }

    getAllAchievementsOfMember(successCallback, errorCallback)
    {
        var endPointURL = "visualization/achievements/"+this._gameId+"/"+this._memberId;
        return this.getAllSimple(endPointURL,successCallback, errorCallback);
    }

    // COMPLETED, REVEALED, ALL
    getAllQuestWithStatusOfMember(questStatus, successCallback, errorCallback)
    {
        var endPointURL = "visualization/quests/"+this._gameId+"/"+this._memberId+"/status/"+questStatus;
        return this.getAllSimple(endPointURL,successCallback, errorCallback);
    }

    getOneQuestProgressOfMember(questId, successCallback, errorCallback)
    {
        var endPointURL = "visualization/quests/"+this._gameId+"/"+this._memberId+"/progress/"+questId;
        return this.getAllSimple(endPointURL,successCallback, errorCallback);
    }

    getOneBadgeDetailOfMember(badgeId, successCallback, errorCallback)
    {
        var endPointURL = "visualization/badges/"+this._gameId+"/"+this._memberId+"/"+badgeId;
        return this.getAllSimple(endPointURL,successCallback, errorCallback);
    }

    getOneQuestDetailOfMember(questId, successCallback, errorCallback)
    {
        var endPointURL = "visualization/quests/"+this._gameId+"/"+this._memberId+"/"+questId;
        return this.getAllSimple(endPointURL,successCallback, errorCallback);
    }

    getOneAchievementDetailOfMember(achievementId, successCallback, errorCallback)
    {
        var endPointURL = "visualization/achievements/"+this._gameId+"/"+this._memberId+"/"+achievementId;
        return this.getAllSimple(endPointURL,successCallback, errorCallback);
    }

/*    triggerAction(actionid,successCallback, errorCallback){
        var endPointURL =  "visualization/actions/"+this._gameId+"/"+actionid+"/"+this._memberId;
        this.util.sendRequest(
            "POST",
            endPointURL,
            "",
            "application/json",
            {},
            function(data, type){
                console.log("trigger success");
                successCallback(data,type);
                return false;
            },
            function(status,error) {
                errorCallback(status,error);
                console.log("trigger failed");
                return false;
            }
        );
    }*/
}
customElements.define(GamificationVisualization.is, GamificationVisualization);