module.exports = {
  getInventory: (appid, contextid, manager) => new Promise(back => {
    manager.getInventoryContents(appid, contextid, true, (error, inventory) => {
      if (error)
        return back('ERROR');

      back(inventory);
    });
  }),
  sendTrade: (manager, tradeLink, items, community, identitySecret) => new Promise(back => {
    const trade = manager.createOffer(tradeLink);
    trade.setMessage('This trade was sent with github.com/timvandam/looter ☺');
    trade.addMyItems(items);

    trade.getUserDetails((error, me, them) => {
      if (error)
        return back('ERROR');

      if (them.probation)
        return back('PROBATION');

      if (me.escrowDays || them.escrowDays)
        return back('ESCROW');

      trade.send((error, status) => {
        if (error)
          return back('TRADEERROR');

        if (community && identitySecret)
          community.acceptConfirmationForObject(identitySecret, trade.id, error => {
            if (error)
              return back('CONFIRMATIONERROR');

            back(trade.id);
          });
        else back(trade.id);
      });
    });
  })
};