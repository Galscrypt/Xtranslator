const CONFIG = {

  DEBUG: false,

  APIS: {
    CHROME_TRANSLATOR: {
      name: 'Chrome Translator',
      initTimeout: 5000
    },

    GOOGLE: {
      name: 'Google Translate',
      url: 'https://translate.googleapis.com/translate_a/single',
      params: { client: 'gtx', sl: 'en', tl: 'ru', dt: 't' },
      timeout: 2000,
      breakerThreshold: 5,
      breakerResetMs: 15000
    },

    MOZHI: {
      name: 'Mozhi',
      instances: [
        'https://mozhi.pussthecat.org',
        'https://mozhi.r4fo.com',
        'https://mozhi.adminforge.de',
        'https://mozhi.bloat.cat',
        'https://mozhi.ducks.party'
      ],
      engine: 'yandex',
      fallbackEngine: 'duckduckgo',
      timeout: 2000,
      breakerThreshold: 3,
      breakerResetMs: 20000
    },

    SIMPLYTRANSLATE: {
      name: 'SimplyTranslate',
      url: 'https://simplytranslate.org/api/translate/',
      timeout: 1500,
      breakerThreshold: 3,
      breakerResetMs: 30000
    },

    LINGVA: {
      name: 'Lingva Translate',
      instances: [
        'https://translate.plausibility.cloud'
      ],
      timeout: 1500,
      breakerThreshold: 2,
      breakerResetMs: 30000
    },

    MYMEMORY: {
      name: 'MyMemory',
      url: 'https://api.mymemory.translated.net/get',
      timeout: 1800,
      breakerThreshold: 1,
      breakerResetMs: 120000
    }
  },

  CACHE: {
    MAX_MEMORY_ENTRIES: 5000,
    STORAGE_KEY: 'padre_translation_cache_v2',
    PERSIST_DEBOUNCE_MS: 2000,
    MAX_STORAGE_ENTRIES: 8000
  },

  QUEUE: {
    MAX_CONCURRENCY: 12,
    RATE_LIMIT_MAX: 500,
    RATE_LIMIT_WINDOW_MS: 60000
  },

  DETECTION: {
    MIN_TWEET_TEXT_LENGTH: 6,
    MIN_TWITTER_SIGNALS: 2,
    HANDLE_REGEX: /@\w{1,15}/,
    FOLLOWERS_REGEX: /(\d[\d,.]*[KMBkmb]?\s*(followers|подписчик)|followers\s*[\d,.]+[KMBkmb]?)/i,
    JOIN_DATE_REGEX: /Joined\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i
  },

  UI: {
    BADGE_COLOR: '#7c3aed',
    TRANSLATION_PENDING_OPACITY: '0.7'
  },

  FEATURES: {
    ENABLE_QUALITY_GATE: true,
    ENABLE_OBSERVER_TEXT_QUALITY_FILTER: true,
    ENABLE_OBSERVER_LINE_CLEANUP: true,
    ENABLE_SLANG_EXPANSION: true,
    ENABLE_POST_FIXES: true,
    ENABLE_DYNAMIC_PROVIDER_ORDER: true
  },

  CRYPTO_PRESERVE: {

    MULTI_WORD: [

      'rug pull', 'rug pulled', 'buy the dip', 'diamond hands', 'paper hands',
      'weak hands', 'strong hands', 'smart money', 'dumb money', 'exit liquidity',
      'dead cat bounce', 'blow off top', 'stop loss', 'take profit', 'limit order',
      'market order', 'order book', 'swing trade', 'day trade', 'copy trade',
      'copy trading', 'margin call', 'short squeeze', 'bear trap', 'bull trap',
      'bull run', 'bear market', 'bull market', 'price action', 'green candle',
      'red candle', 'flash crash', 'panic sell', 'panic buy',

      'yield farming', 'liquidity pool', 'liquidity provider', 'impermanent loss',
      'flash loan', 'smart contract', 'token burn', 'total supply', 'max supply',
      'circulating supply', 'market cap', 'liquid staking',

      'floor price', 'sweep the floor', 'free mint', 'dutch auction', 'open edition',

      'priority fee', 'compute units', 'proof of history', 'bonding curve',
      'spl token', 'pump.fun', 'magic eden',

      'sniper bot', 'trading bot', 'sandwich attack', 'jito bundle', 'flash bot',
      'stealth launch', 'fair launch', 'dev wallet', 'private sale',

      'ape in', 'ape into', 'aped in', 'aped into', 'wen moon', 'wen lambo',
      'to the moon', 'number go up', 'up only', 'not gonna make it',
      'gonna make it', 'probably nothing', 'this is the way', 'few understand',
      'generational wealth', 'printing money', 'free money',

      'on-chain', 'off-chain', 'cross-chain', 'seed phrase', 'private key',
      'public key', 'cold wallet', 'hot wallet', 'hardware wallet',
      'gas fee', 'gas fees',
    ],

    SINGLE_WORD: [

      'hodl', 'hodling', 'fud', 'fomo', 'dyor', 'nfa', 'wagmi', 'ngmi',
      'lfg', 'iykyk', 'gm', 'gn', 'gg',
      'ath', 'atl', 'dca', 'roi', 'apy', 'apr', 'tvl', 'mcap', 'fdv',
      'defi', 'dex', 'cex', 'amm', 'dao', 'dapp', 'nft', 'pfp',
      'lp', 'otc', 'pnl', 'rpc', 'evm', 'tps', 'mev',
      'ico', 'ido', 'ieo', 'kyc', 'aml', 'ca',
      'btd', 'btfd', 'ct', 'kol', 'og',
      'l1', 'l2', 'l3', 'zk',
      'ta', 'fa', 'rsi', 'macd',

      'degen', 'degens', 'degening',
      'ape', 'aped', 'aping',
      'whale', 'whales',
      'rekt', 'rekted',
      'rugged', 'rugger',
      'shill', 'shilled', 'shilling', 'shiller',
      'bullish', 'bearish',
      'mooning', 'moonshot', 'moonboy',
      'bagholder', 'bagholders', 'bagholding',
      'copium', 'hopium',
      'gigabrain', 'gigachad', 'normie', 'pleb', 'maxi',
      'fren', 'frens', 'ser', 'anon', 'anons',
      'jeet', 'jeets', 'jeeted', 'jeeting',
      'chad', 'npc', 'intern',

      'pump', 'pumped', 'pumping', 'pumps',
      'dump', 'dumped', 'dumping', 'dumps',
      'moon', 'dip', 'dips',
      'rally', 'breakout', 'breakdown',
      'accumulation', 'capitulation',
      'liquidation', 'liquidated',
      'leverage', 'leveraged',
      'perps', 'perpetuals', 'futures', 'scalp', 'scalping',
      'slippage', 'arbitrage', 'arb',

      'staking', 'staked', 'restaking', 'unstaking', 'unstaked',
      'swap', 'swapped', 'swaps',
      'bridge', 'bridged', 'bridging',
      'vault', 'vaults',
      'lending', 'borrowing', 'collateral',
      'governance', 'protocol', 'protocols',
      'tokenomics', 'vesting',
      'airdrop', 'airdrops', 'airdropped',
      'whitelist', 'whitelisted',
      'mint', 'minted', 'minting', 'mints',

      'solana', 'raydium', 'jupiter', 'jito',
      'marinade', 'orca', 'drift', 'pyth',
      'tensor', 'phantom', 'solflare', 'metaplex',
      'meteora', 'marginfi', 'solend', 'bonfida',
      'pumpswap', 'alpenglow',

      'altcoin', 'altcoins', 'shitcoin', 'shitcoins',
      'memecoin', 'memecoins', 'stablecoin', 'stablecoins',
      'satoshi', 'sats', 'gwei', 'wei',

      'snipe', 'sniped', 'sniping', 'sniper',
      'frontrun', 'frontrunning', 'frontrunner',
      'backrun', 'backrunning',
      'sandwich', 'sandwiched',
      'honeypot', 'honeypots',
      'bundle', 'bundled',

      'blockchain', 'mainnet', 'testnet', 'devnet',
      'validator', 'validators',
      'oracle', 'oracles',
      'multisig', 'rollup', 'rollups', 'sidechain',
      'hashrate', 'halving',

      'token', 'tokens', 'wallet', 'wallets', 'lambo',

      '4chan', 'reddit', 'discord', 'telegram',
    ]
  },

  PRESERVE_TERMS: [
    'hodl', 'degen', 'airdrop', 'mint', 'burn', 'rug', 'pump', 'dump',
    'dex', 'cex', 'sol', 'eth', 'btc', 'usdt', 'usdc', 'nft', 'tvl',
    'lp', 'amm', 'dao', 'gas', 'whitepaper', 'launch', 'whitelist',
    'staking', 'yield', 'farming', 'liquidity', 'mainnet', 'testnet',
    'bridge', 'token', 'protocol', 'oracle', 'validator', 'rpc', 'explorer'
  ],

  EXPAND_ABBREVIATIONS: {
    idk: 'i do not know',
    imo: 'in my opinion',
    imho: 'in my humble opinion',
    tbh: 'to be honest',
    ngl: 'not gonna lie',
    rn: 'right now',
    fr: 'for real',
    wtf: 'what the fuck',
    wth: 'what the hell',
    irl: 'in real life',
    btw: 'by the way',
    af: 'as fuck',
    sus: 'suspicious',
    bc: 'because',
    cuz: 'because'
  },

  CRYPTO_SLANG_MAP: {
    'got rugged': 'got scammed',
    rugged: 'scammed',
    bagholder: 'holder of losing tokens',
    bagholders: 'holders of losing tokens',
    jeeted: 'sold early',
    jeet: 'panic seller',
    'ape in': 'buy aggressively',
    aping: 'buying aggressively',
    fomo: 'fear of missing out',
    fud: 'fear uncertainty and doubt',
    narra: 'narrative',
    ngmi: 'not going to make it',
    wagmi: 'we are going to make it',
    rekt: 'lost money',
    'to the moon': 'price going up fast',
    'diamond hands': 'holding strong',
    'paper hands': 'selling too early',
    'weak hands': 'selling early',
    'exit liquidity': 'people who buy at the top'
  },

  POST_TRANSLATION_FIXES: {
    '\u0442\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442': '\u0432\u0430\u0439\u0442\u043f\u0435\u0439\u043f\u0435\u0440',
    '\u0432\u043e\u0437\u0434\u0443\u0448\u043d\u044b\u0439 \u0441\u0431\u0440\u043e\u0441': '\u0430\u0438\u0440\u0434\u0440\u043e\u043f',
    '\u0447\u0435\u043a\u0430\u043d\u043a\u0430': '\u043c\u0438\u043d\u0442',
    '\u0441\u0436\u0438\u0433\u0430\u043d\u0438\u0435': 'burn',
    '\u043f\u0443\u043b \u043b\u0438\u043a\u0432\u0438\u0434\u043d\u043e\u0441\u0442\u0438': 'LP',
    '\u0441\u043c\u0430\u0440\u0442 \u043a\u043e\u043d\u0442\u0440\u0430\u043a\u0442': '\u0441\u043c\u0430\u0440\u0442-\u043a\u043e\u043d\u0442\u0440\u0430\u043a\u0442'
  }
};
