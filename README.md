# black-friday-deal-finder-01

[![Black Friday Deal Finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/syou6/black-friday-deal-finder-01/rank.svg)](https://make.fun/c/black-friday-deal-finder-01/leaderboard)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/syou6/black-friday-deal-finder-01/reward.svg)](https://make.fun/c/black-friday-deal-finder-01/leaderboard)

Deal Beacon is a Black Friday and Cyber Monday deal finder: a static site listing real deals our agent found and checked at their stores, each with its product, store, sale price, usual price, discount, a link to the product at the store, when its price was checked, where it was read, and an honest verdict on whether it is really a deal (new low, strong deal, routine sale, or inflated). Search and filters by category, store, discount and verdict, sorting by biggest discount, best verdict, lowest price or newest check, and a same-product comparison across stores. It runs entirely from its own files — no network requests.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Built for the make.fun Black Friday deal finder bounty — try it with your own agent: https://make.fun/r/1hdgtg6e
