export const campaign = 'paddleresults_launch_v1';
export const source = 'paddleresults.com';
export function attribution(locale, content) {
  return { utm_source: source, utm_medium: 'referral', utm_campaign: campaign, utm_content: `${content}_${locale}` };
}
export function storeLinks(locale, placement = 'hero') {
  const apple = new URL('https://apps.apple.com/app/id6822209038');
  apple.searchParams.set('pt', '128893100');
  apple.searchParams.set('ct', `paddleresults_v1_${locale.replace('-', '')}${placement === 'hero' ? '' : `_${placement}`}`);
  apple.searchParams.set('mt', '8');
  for (const [k, v] of Object.entries(attribution(locale, `ios_${placement}`))) apple.searchParams.set(k, v);
  const google = new URL('https://play.google.com/store/apps/details');
  google.searchParams.set('id', 'eu.paddlestats.app');
  google.searchParams.set('hl', locale);
  const tags = attribution(locale, `android_${placement}`);
  for (const [k, v] of Object.entries(tags)) google.searchParams.set(k, v);
  google.searchParams.set('referrer', new URLSearchParams(tags).toString());
  return { apple: apple.href, google: google.href };
}
export function webLink(locale, path = '/', content = 'web_footer') {
  const url = new URL(path, 'https://paddlestats.eu');
  url.searchParams.set('lang', locale);
  for (const [k, v] of Object.entries(attribution(locale, content))) url.searchParams.set(k, v);
  return url.href;
}
