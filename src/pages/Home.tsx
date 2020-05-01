import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { ClassicFactory } from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';


class Home extends React.Component {

  private requestResultCodes = "false";

  props: any;

  private scans = [];
  private scanners = [{ "SCANNER_NAME": "Please Wait...", "SCANNER_INDEX": 0, "SCANNER_CONNECTION_STATE": true }];
  private selectedScanner = "Please Select...";
  private selectedScannerId = -1;
  private ean8Decoder = true;   //  Model for decoder
  private ean13Decoder = true;  //  Model for decoder
  private code39Decoder = true; //  Model for decoder
  private code128Decoder = true;//  Model for decoder
  private dataWedgeVersion = "Pre 6.3. Please create & configure profile manually.  See the ReadMe for more details.";
  private availableScannersText = "Requires Datawedge 6.3+"
  private activeProfileText = "Requires Datawedge 6.3+";
  private commandResultText: String = "Messages from DataWedge will go here";
  private uiHideDecoders = true;
  private uiDatawedgeVersionAttention = true;
  private uiHideSelectScanner = true;
  private uiHideShowAvailableScanners = false;
  private uiHideCommandMessages = true;
  private uiHideFloatingActionButton = true;
  mInstance = this;
  constructor(props: any, mInstance: Home) {
    super(props);
    mInstance = this;
    // console.log(props);
    // console.log('webIntent' + webIntent);
    // console.log(webIntent);
    // this.mWebIntents = webIntent;

    // this.registerBroadcastReciever = this.registerBroadcastReciever.bind(this);
    // this.createProfile();
    (window as any).plugins.intentShim.registerBroadcastReceiver({

      filterActions: [

        'io.ionic.starter.ACTION',

        'com.symbol.datawedge.api.RESULT_ACTION'
      ],

      filterCategories: [

        'android.intent.category.DEFAULT'

      ]
    },

      function (intent: any) {

      //  Check manufacturer.  Exit if this app is not running on a Zebra device
         //console.log("Device manufacturer is: " + mInstance.device.manufacturer);
        
        //  Broadcast received
        console.log(JSON.stringify(intent.extras));
         //  Broadcast received
         console.log(intent.extras);
    
        //  Emit a separate event for the result associated with this scan.  This will only be present in response to
          //  API calls which included a SEND_RESULT extra
          if (intent.extras.hasOwnProperty('RESULT_INFO')) {
            let commandResult = intent.extras.RESULT + " (" +
              intent.extras.COMMAND.substring(intent.extras.COMMAND.lastIndexOf('.') + 1, intent.extras.COMMAND.length) + ")";  // + JSON.stringify(intent.extras.RESULT_INFO);
              mInstance.publishCommandResult(commandResult.toLowerCase());
          }
    
    
          if (intent.extras.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_VERSION_INFO')) {
            //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX  
            var versionInfo = intent.extras['com.symbol.datawedge.api.RESULT_GET_VERSION_INFO'];
            console.log('Version Info: ' + JSON.stringify(versionInfo));
            let datawedgeVersion = versionInfo['DATAWEDGE'];
            console.log("Datawedge version: " + datawedgeVersion);
    
            //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
            if (datawedgeVersion >= "6.3")
              mInstance.dw63ApisAvailable();
            if (datawedgeVersion >= "6.4")
            alert("dw64ApisAvailable");
            mInstance.dw64ApisAvailable();
            if (datawedgeVersion >= "6.5")
            alert("dw65ApisAvailable");
              mInstance.dw64ApisAvailable();
              mInstance.dw65ApisAvailable();
          }
    
          else if (intent.extras.hasOwnProperty('com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS')) {
            //  Return from our request to enumerate the available scanners
            let enumeratedScanners = intent.extras['com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS'];
            mInstance.hasEnumeratedScanners(enumeratedScanners);
          }
          else if (intent.extras.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE')) {
            //  Return from our request to obtain the active profile
            let activeProfile = intent.extras['com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE'];
            mInstance.getActiveProfile(activeProfile);
          }
          else if (!intent.extras.hasOwnProperty('RESULT_INFO')) {
            //  A barcode has been scanned
            mInstance.scanResult(intent, new Date().toLocaleTimeString());
          }
      });

      mInstance.sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");
  }

  // createProfile() {
  //   let profileConfig2 = {

  //     "PROFILE_NAME": "ZebraIonicDemo",
    
  //     "PROFILE_ENABLED": "true",
    
  //     "CONFIG_MODE": "UPDATE",
    
  //     "PLUGIN_CONFIG": {
    
  //       "PLUGIN_NAME": "INTENT",
    
  //       "RESET_CONFIG": "true",
    
  //       "PARAM_LIST": {
    
  //         "intent_output_enabled": "true",
    
  //         "intent_action": "com.zebra.ionicdemo.ACTION",
    
  //         "intent_delivery": "2" // Broadcast
    
  //       }
    
  //     }
    
  //   };
    
  //   (window as any).plugins.intentShim.sendBroadcast({
    
  //     action: 'com.symbol.datawedge.api.ACTION',
    
  //     extras: {
    
  //       "com.symbol.datawedge.api.SET_CONFIG": profileConfig2,
    
  //       "SEND_RESULT": this.requestResultCodes
    
  //     }
    
  //   },
    
  //     function () { },  //  Success in sending the intent, not success of DW to process the intent.
    
  //     function () { }  //  Failure in sending the intent, not failure of DW to process the intent.
    
  //   );
  // }

  registerBroadcastReciever() {
    
  }

  //  Emit a separate event for the result associated with this scan.  This will only be present in response to
//  API calls which included a SEND_RESULT extra
// 'data:commandResult', 

 //  The result (success / failure) of our last API call along with additional information
publishCommandResult(commandResult: String){
  // this.commandResultText = commandResult;
  // this.changeDetectorRef.detectChanges();
  alert(commandResult);
}

dw63ApisAvailable(){
  console.log("DataWedge 6.3 APIs are available");
        //  We are able to create the profile under 6.3.  If no further version events are received, notify the user
        //  they will need to create the profile manually
        this.mInstance.sendCommand("com.symbol.datawedge.api.CREATE_PROFILE", "ZebraIonicDemo");
        this.dataWedgeVersion = "6.3.  Please configure profile manually.  See the ReadMe for more details.";

        //  Although we created the profile we can only configure it with DW 6.4.
        this.mInstance.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

        //  Enumerate the available scanners on the device
        this.mInstance.sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

}


dw64ApisAvailable (){
  
  console.log("DataWedge 6.4 APIs are available");

  //  Documentation states the ability to set a profile config is only available from DW 6.4.
  //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
  this.dataWedgeVersion = "6.4";
  this.uiDatawedgeVersionAttention = false;
  this.uiHideDecoders = !true;

  //  Configure the created profile (associated app and keyboard plugin)
  let profileConfig = {
    "PROFILE_NAME": "ZebraIonicDemo",
    "PROFILE_ENABLED": "true",
    "CONFIG_MODE": "UPDATE",
    "PLUGIN_CONFIG": {
      "PLUGIN_NAME": "BARCODE",
      "RESET_CONFIG": "true",
      "PARAM_LIST": {}
    },
    "APP_LIST": [{
      "PACKAGE_NAME": "io.ionic.starter",
      "ACTIVITY_LIST": ["*"]
    }]
  };
  this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

  //  Configure the created profile (intent plugin)
  let profileConfig2 = {
    "PROFILE_NAME": "ZebraIonicDemo",
    "PROFILE_ENABLED": "true",
    "CONFIG_MODE": "UPDATE",
    "PLUGIN_CONFIG": {
      "PLUGIN_NAME": "INTENT",
      "RESET_CONFIG": "true",
      "PARAM_LIST": {
        "intent_output_enabled": "true",
        "intent_action": "io.ionic.starter.ACTION",
        "intent_delivery": "2"
      }
    }
  };
  this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

  //  Give some time for the profile to settle then query its value
  setTimeout(function () {
    // home.this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
  }, 1000);

  // this.changeDetectorRef.detectChanges();
}

dw65ApisAvailable(){

}

hasEnumeratedScanners(enumeratedScanners: any) {
  throw new Error("Method not implemented.");
}

getActiveProfile(activeProfile: any){

}

scanResult(intent: any, dateTime: String){
  //  Broadcast received

  console.log('Received Intent: ' + JSON.stringify(intent.extras));
  alert(intent.extras['com.symbol.datawedge.data_string']);

}


  //  Send a broadcast intent to the DW service which is present on all Zebra devcies.
  //  This functionality requires DW6.3+ as that is the version where the com.symbol.datawedge.api.ACTION
  //  was introduced.
  //  extraValue may be a String or a Bundle
  sendCommand(extraName: string, extraValue: any) {
    console.log("Sending Command: " + extraName + ", " + JSON.stringify(extraValue));
    (window as any).plugins.intentShim.sendBroadcast({
      action: 'com.symbol.datawedge.api.ACTION',
      extras: {
        [extraName]: extraValue,
        "SEND_RESULT": this.requestResultCodes
      }
    },
      function (success: any) { 
        console.log(extraName + " Success");
        console.log(success)
      },  //  Success in sending the intent, not success of DW to process the intent.
      function (error : any) {
        console.log(extraName + " error");
        console.log(error);
       }   //  Failure in sending the intent, not failure of DW to process the intent.
    );
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Blank</IonTitle>
            </IonToolbar>
          </IonHeader>
          <ExploreContainer />
        </IonContent>
      </IonPage>
    );
  }
}

export default Home;
