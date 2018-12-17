# RazKapamilyaBot

This is a chatbot POC using Azure Bot Services, Bot Framework v3.
It uses simple waterfal dialog flows and returns results based from RSS feeds and 3 QnA Maker Knowledge bases.

My learnings in implementing this POC were blogged [here](https://raffertyuy.com/2018/10/11/rss-and-multi-faq-chat-bot-high-level-design-part-1/).

## Getting Started

To get started, simply clone this repository. For advanced Node.JS developers, you may use any text editor can be used as the IDE. For basic users, feel free to use the same IDE I used - [Visual Studio Code](https://code.visualstudio.com/).

### Local Development Tools

Aside from Visual Studio Code, I also used the following:
1. [nodemon](https://nodemon.io/)
2. [Azure Bot Service Emulator](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-debug-emulator?view=azure-bot-service-4.0)

### Environment Variables

Environment variables are required to run this service. The variables to configure can be seen in the [sample launch.json file](.vscode/launch.sample.json).
