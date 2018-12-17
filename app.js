/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var request = require('request');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

var dialogConstants = require('./dialogConstants');
var logicAppHandler = require('./logicAppHandler');
var cardFactory = require('./cardFactory');
var qnaHandler = require('./qnaHandler');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector, [
    function(session){
        session.send(dialogConstants.VersionMessage);
        session.beginDialog("mainMenu");
    }
]).set('storage', tableStorage);

//=========================================================
// General Dialogs
//=========================================================
bot.dialog("mainMenu", [
    function(session) {
        builder.Prompts.choice(
            session, "What information are you looking for?", dialogConstants.MainMenu,
            { listStyle: builder.ListStyle.button }
        );
    },
    function(session, results) {
        if(results.response) {
            session.beginDialog(dialogConstants.MainMenu[results.response.entity].item);
        }
    }
])
.triggerAction({
    matches: /^restart$|^reset$|^home$|^main$|^main\s*menu/i,
});

bot.dialog("help", [
    function(session) {
        session.send("Sorry, my help capabilites are still under development. The best way I can help you for now is to restart this chat session.")
        builder.Prompts.confirm(session, "Do you want to restart and go back to the main menu?");
    },
    function(session, results) {
        if (results.response) {
            session.replaceDialog("mainMenu", { reprompt: true });
        }
    }
])
.triggerAction({
    matches: /^help$/i,
});

bot.dialog("version", [
    function(session) {
        session.send(dialogConstants.VersionMessage).endDialog();
        session.beginDialog("mainMenu");
    }
])
.triggerAction({
    matches: /^version$/i,
});

//=========================================================
// News Dialog
//=========================================================
bot.dialog("newsMenu", [
    function(session) {
        builder.Prompts.choice(
            session, "Welcome to ABS-CBN News. What topic are you looking for?", dialogConstants.NewsMenu,
            { listStyle: builder.ListStyle.button }
        );
    },
    function(session, results) {
        if(results.response) {
            var topic = dialogConstants.NewsMenu[results.response.entity].item;
            var siteUrl = "";
            var rssUrl = "";

            switch(topic) {
                case "newsLatest":
                    siteUrl = process.env.NewsSiteUrl;
                    rssUrl = process.env.NewsRssUrl;
                case "newsNation":
                    siteUrl = process.env.NewsNationSiteUrl;
                    rssUrl = process.env.NewsNationRssUrl;
                    break;
                case "newsBusiness":
                    siteUrl = process.env.NewsBusinessSiteUrl;
                    rssUrl = process.env.NewsBusinessRssUrl;
                    break;
                case "newsEntertainment":
                    siteUrl = process.env.NewsEntertainmentSiteUrl;
                    rssUrl = process.env.NewsEntertainmentRssUrl;
                    break;
                case "newsMetroManila":
                    siteUrl = process.env.NewsMetroManilaSiteUrl;
                    rssUrl = process.env.NewsMetroManilaRssUrl;
                    break;
                case "newsSports":
                    siteUrl = process.env.NewsSportsSiteUrl;
                    rssUrl = process.env.NewsSportsRssUrl;
                    break;
                case "mainMenu":
                    session.replaceDialog("mainMenu", { reprompt: true });
                    break;
                default:
                    session.send("Sorry, there is no news feed for that topic yet. Please select a different topic.");
                    session.replaceDialog("newsMenu", { reprompt: true });
                    break;
            };

            if (siteUrl != "" && rssUrl != "") {
                var mycallback = function(response) {
                    var cards = cardFactory.getRssCardsAttachment(
                        session, response,
                        "ABS-CBN News",
                        siteUrl, process.env.NewsImageUrl);

                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel)
                    msg.attachments(cards);
                    session.send(msg);
        
                    session.replaceDialog("newsMenu", { reprompt: true });
                };
            
                logicAppHandler.getRssFeed(session.message.text, rssUrl, mycallback);
            }
        }
    }
]);

//=========================================================
// Entertainment Dialog
//=========================================================
bot.dialog("entertainmentMenu", [
    function(session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments(
            cardFactory.getGoToSiteCardAttachment(
                session, "ABS-CBN Entertainment", "", "",
                process.env.EntertainmentSiteUrl, process.env.EntertainmentImageUrl
            )
        );
        session.send(msg).endDialog();
        session.beginDialog("mainMenu");
    }
]);

//=========================================================
// MYX Dialog
//=========================================================
bot.dialog("myxMenu", [
    function(session){
        var mycallback = function(response) {
            var cards = cardFactory.getRssCardsAttachment(
                session, response,
                "MYX",
                process.env.MyxSiteUrl, process.env.MyxImageUrl);

            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments(cards);
            session.send(msg).endDialog();

            session.beginDialog("mainMenu");
        };
    
        logicAppHandler.getRssFeed(session.message.text, process.env.MyxRssUrl, mycallback);
    }
]);

//=========================================================
// Lifestyle Dialog
//=========================================================
bot.dialog("lifestyleMenu", [
    function(session){
        var mycallback = function(response) {
            var cards = cardFactory.getRssCardsAttachment(
                session, response,
                "ABS-CBN Lifestyle",
                process.env.LifestyleSiteUrl, process.env.LifestyleImageUrl);

            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments(cards);
            session.send(msg).endDialog();

            session.beginDialog("mainMenu");
        };
    
        logicAppHandler.getRssFeed(session.message.text, process.env.LifestyleRssUrl, mycallback);
    }
]);

//=========================================================
// Sports Dialog
//=========================================================
bot.dialog("sportsMenu", [
    function(session){
        var mycallback = function(response) {
            var cards = cardFactory.getRssCardsAttachment(
                session, response,
                "ABS-CBN Sports",
                process.env.SportsSiteUrl, process.env.SportsImageUrl);

            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments(cards);
            session.send(msg).endDialog();

            session.beginDialog("mainMenu");
        };
    
        logicAppHandler.getRssFeed(session.message.text, process.env.SportsRssUrl, mycallback);
    }
]);

//=========================================================
// Push Dialog
//=========================================================
bot.dialog("pushMenu", [
    function(session){
        var mycallback = function(response) {
            var cards = cardFactory.getRssCardsAttachment(
                session, response,
                "Push",
                process.env.PushSiteUrl, process.env.PushImageUrl);

            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments(cards);
            session.send(msg).endDialog();

            session.beginDialog("mainMenu");
        };
    
        logicAppHandler.getRssFeed(session.message.text, process.env.PushRssUrl, mycallback);
    }
]);

//=========================================================
// E! News Dialog
//=========================================================
bot.dialog("eNewsMenu", [
    function(session){
        var mycallback = function(response) {
            var cards = cardFactory.getRssCardsAttachment(
                session, response,
                "E! News",
                process.env.ENewsSiteUrl, process.env.ENewsImageUrl);

            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments(cards);
            session.send(msg).endDialog();

            session.beginDialog("mainMenu");
        };
    
        logicAppHandler.getRssFeed(session.message.text, process.env.ENewsRssUrl, mycallback);
    }
]);

//=========================================================
// Choose Philippines Dialog
//=========================================================
bot.dialog("choosePhilippinesMenu", [
    function(session){
        var mycallback = function(response) {
            var cards = cardFactory.getRssCardsAttachment(
                session, response,
                "Choose Philippines",
                process.env.ChoosePhilippinesSiteUrl, process.env.ChoosePhilippinesImageUrl);

            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments(cards);
            session.send(msg).endDialog();

            session.beginDialog("mainMenu");
        };
    
        logicAppHandler.getRssFeed(session.message.text, process.env.ChoosePhilippinesRssUrl, mycallback);
    }
]);

//=========================================================
// Trabahanap Dialog
//=========================================================
bot.dialog("trabahanapMenu", [
    function(session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments(
            cardFactory.getGoToSiteCardAttachment(
                session, "Trabahanap", "",
                `Ang TrabaHanap ay isang job-hunting site na tutulong sa mga aplikanteng makahanap ng trabaho na babagay o tutugma sa kanilang kakayahan, pangangailangan, at lokasyon. Sa tulong ng teknolohiya at Live, Inc., isang US-based digital content delivery company, mas pinadali at pinabilis ng TrabaHanap ang paghahanap ng blue collar jobs o mga trabahong pisikal.\r\n
TrabaHanap ang naging tugon ng ABS-CBN sa lumalaking problema ng job mismatch sa Pilipinas. Patuloy ang pagkalap namin ng mga trabaho at oportunidad sa iba’t ibang sektor dahil layunin naming mabigyan ang mas marami pang pamilyang Pilipino ng magandang kinabukasan.`,
                process.env.TrabahanapSiteUrl, process.env.TrabahanapImageUrl
            )
        );
        session.send(msg).endDialog();
        session.beginDialog("mainMenu");
    }
]);

//=========================================================
// Government
//=========================================================
bot.dialog("sssQna", [
    function(session) {
        if (session.userData.newQna) {
            session.userData.newQna = false;
        }
        else {
            var mycallback = function(response) {
                session.send(response);
            };
        
            qnaHandler.getQnaSSS(session.message.text, mycallback);
        }
    }
]);

bot.dialog("ltoLicensePermitQna", [
    function(session) {
        if (session.userData.newQna) {
            session.userData.newQna = false;
        }
        else {
            var mycallback = function(response) {
                session.send(response);
            };
        
            qnaHandler.getQnaLTOLicensePermit(session.message.text, mycallback);
        }
    }
]);

bot.dialog("ltoVehicleQna", [
    function(session) {
        if (session.userData.newQna) {
            session.userData.newQna = false;
        }
        else {
            var mycallback = function(response) {
                session.send(response);
            };
        
            qnaHandler.getQnaLTOVehicle(session.message.text, mycallback);
        }
    }
]);

bot.dialog("ltoLawQnaMaker", [
    function(session) {
        if (session.userData.newQna) {
            session.userData.newQna = false;
        }
        else {
            var mycallback = function(response) {
                session.send(response);
            };
        
            qnaHandler.getQnaLTOLaw(session.message.text, mycallback);
        }
    }
]);

bot.dialog("ltoSpecialPlatesQna", [
    function(session) {
        if (session.userData.newQna) {
            session.userData.newQna = false;
        }
        else {
            var mycallback = function(response) {
                session.send(response);
            };
        
            qnaHandler.getQnaLTOSpecialPlates(session.message.text, mycallback);
        }
    }
]);

bot.dialog("governmentMenu", [
    function(session){
        builder.Prompts.choice(
            session, "Which government agency do you need help on?", dialogConstants.GovernmentMenu,
            { listStyle: builder.ListStyle.button }
        );
    },
    function(session, results) {
        var intent = "Government";
        var subintent1 = "";

        switch(dialogConstants.GovernmentMenu[results.response.entity].item)
        {
            case dialogConstants.GovernmentMenu["SSS"].item:
                subintent1 = "SSS";

                session.send(`Hi, I am your Friendly SSS QnA. What's up?
To exit, please type
    "Government" - To go back to the government menu options
    "Home" - To go back to the main menu options`);

                session.endDialog();
                session.userData.newQna = true;
                session.beginDialog("sssQna");
                break;
            case dialogConstants.GovernmentMenu["LTO - License & Permit"].item:
                subintent1 = "LTO - License & Permit";

                session.send(`Hi, I am your Professional LTO - License & Permit QnA. What is your question?
To exit, please type
    "Government" - To go back to the government menu options
    "Home" - To go back to the main menu options`);

                session.endDialog();
                session.userData.newQna = true;
                session.beginDialog("ltoLicensePermitQna");
                break;
            case dialogConstants.GovernmentMenu["LTO - Motor Vehicle Registration"].item:
                subintent1 = "LTO - Motor Vehicle Registration";

                session.send(`Hi, I am your Friendly LTO - Motor Vehicle Registration QnA Chat. What's up?
To exit, please type
    "Government" - To go back to the government menu options
    "Home" - To go back to the main menu options`);

                session.endDialog();
                session.userData.newQna = true;
                session.beginDialog("ltoVehicleQna");
                break;
            case dialogConstants.GovernmentMenu["LTO - Law Enforcement & Adjudication of Cases"].item:
                subintent1 = "LTO - Law Enforcement & Adjudication of Cases";

                session.send(`Hi, I am your Professional LTO - Law Enforcement & Adjudication of Cases QnA. What is your question?
To exit, please type
    "Government" - To go back to the government menu options
    "Home" - To go back to the main menu options`);

                session.endDialog();
                session.userData.newQna = true;
                session.beginDialog("ltoLawQna");
                break;
            case dialogConstants.GovernmentMenu["LTO - Optional Motor Vehicle Special Plates"].item:
                subintent1 = "LTO - Optional Motor Vehicle Special Plates";

                session.send(`Yow! I am your Comical LTO - Optional Motor Vehicle Special Plates QnA. 'Sup?
To exit, please type
    "Government" - To go back to the government menu options
    "Home" - To go back to the main menu options`);

                session.endDialog();
                session.userData.newQna = true;
                session.beginDialog("ltoSpecialPlatesQna");
                break;
            case dialogConstants.GovernmentMenu["Pag-IBIG"].item:
                subintent1 = "Pag-IBIG";

                var msg = new builder.Message(session);
                msg.attachmentLayout(builder.AttachmentLayout.carousel)
                msg.attachments(
                    cardFactory.getGoToSiteCardAttachment(
                        session, "Home Development Mutual Fund",
                        "Sa Pag-IBIG ang pinaghirapan may katuparan", "",
                        process.env.PagIbigSiteUrl, process.env.PagIbigImageUrl
                    )
                );
                session.send(msg);
                session.replaceDialog("governmentMenu", { reprompt: true });
                break;
            case dialogConstants.GovernmentMenu["Back"].item:
                session.endDialog();
                session.beginDialog("mainMenu");
                break;
            default:
                session.replaceDialog("governmentMenu", { reprompt: true });
                break;
        };
    }
])
.triggerAction({
    matches: /^government$/i,
});