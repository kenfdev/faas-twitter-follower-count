// Copyright Alex Ellis 2018
// OpenFaaS ts function: fetches follower count from Twitter via legacy
// mobile HTML back-end.
// Request body should be the name of the account i.e. `Docker`
// Get TS template from here -> https://github.com/openfaas/templates/pull/39

import * as cheerio from 'cheerio';
import * as request from 'request';

interface FunctionResponse {
  followers?: number;
  error: boolean;
}

export const handle: Handler<string, FunctionResponse> = (context, callback) => {
  const username = context.trim();

  const url = `https://mobile.twitter.com/${username}`;
  const r = {
    headers: { 'User-Agent': 'curl/7.54.0' },
    uri: url
  };

  request.get(r, (err, res, body) => {
    if (err) {
      callback(err, { error: true });
    }

    if (res.statusCode === 200) {
      let msg = getFollowers(username, body);

      return callback(undefined, { followers: msg, error: false });
    }

    return callback(`Bad status code: ${res.statusCode} ${body}`, {
      error: true
    });
  });
};

function getFollowers(account: string, body: string): number {
  const $ = cheerio.load(body);

  const selector = `a[href='/${account}/followers'] div.statnum`;
  const count = Number(
    $(selector)
      .text()
      .replace(',', '')
  );

  return count;
}