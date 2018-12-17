var builder = require('botbuilder');
var striptags = require('striptags');
var entities = require('html-entities').AllHtmlEntities;

var maxRssResults = process.env.MaxRssResults || 5;

function getRssCardsAttachment(session, rssArray, defaultTitle, siteUrl, imageUrl) {
    if (rssArray.length == 0)
    {
        return getGoToSiteCardAttachment(
            session, defaultTitle,
            "Sorry, no content feed is available at this time.",
            "",
            siteUrl, imageUrl
            );
    }

    var cards = [];
    var max = rssArray.length < maxRssResults ? rssArray.length : maxRssResults;
    for (var i = 0; i < max; i++)
    {
        var rss = rssArray[i];

        var card = new builder.ThumbnailCard(session)
            .title(rss.title)
            .images([
                builder.CardImage.create(session, imageUrl)
            ]);

        if (rss.subtitle != null && rss.subtitle.trim() != "")
            card.subtitle(rss.subtitle);
        if (rss.summary != null && rss.summary.trim() != "")
            card.text(convertToPlainText(rss.summary));
        if (rss.primaryLink != null && rss.primaryLink.trim() != "")
            card.buttons([
                builder.CardAction.openUrl(session, rss.primaryLink, "Read More...")
            ]);
        else
            card.buttons([
                builder.CardAction.openUrl(session, siteUrl, "Read More...")
            ]);
       
        cards.push(card);
    }

    return cards;
}

function getGoToSiteCardAttachment(session, title, subtitle, text, siteUrl, imageUrl) {
    var cards = [];
    
    var card = new builder.HeroCard(session)
        .title(title)
        .images([
            builder.CardImage.create(session, imageUrl)
        ])
        .buttons([
            builder.CardAction.openUrl(session, siteUrl, "Go to Site")
        ]);

    if (subtitle != null && subtitle.trim() != "")
        card.subtitle(subtitle);
    if (text != null && text.trim() != "")
        card.text(convertToPlainText(text));

    cards.push(card);

    return cards;
}

function convertToPlainText(text)
{
    return entities.decode(striptags(text));
}

module.exports = {
    getRssCardsAttachment: function(session, rssArray, defaultTitle, siteUrl, imageUrl) {
        return getRssCardsAttachment(session, rssArray, defaultTitle, siteUrl, imageUrl);
    },
    getGoToSiteCardAttachment: function(session, title, subtitle, text, siteUrl, imageUrl) {
        return getGoToSiteCardAttachment(session, title, subtitle, text, siteUrl, imageUrl);
    }
};