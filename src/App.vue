<template>
  <div class="ayumi-tooltip" :style="{ left: `${x}px`,  top: `${y}px`}">
    <div class="loading" v-if="loading">Loading...</div>
    <div class="character" v-if="!loading" :class="[ `rarity-${rarity}`, `affinity-${affinity}` ]">
      <div class="portrait">
        <span class="char-name">{{ name }}</span>
        <img :src="avatar" class="char-img">
        <span class="faction">{{ faction }}</span>
      </div>
      <dl class="stats">
        <div><dt>HP</dt> <dd>{{ hp }}</dd></div>
        <div><dt>ATK</dt> <dd>{{ atk }}</dd></div>
        <div><dt>DEF</dt> <dd>{{ def }}</dd></div>
        <div><dt>SPD</dt> <dd>{{ spd }}</dd></div>
        <div><dt>C.RATE</dt> <dd>{{ crat }}%</dd></div>
        <div><dt>C.DMG</dt> <dd>{{ cdmg }}%</dd></div>
        <div><dt>RES</dt> <dd>{{ res }}</dd></div>
        <div><dt>ACC</dt> <dd>{{ acc }}</dd></div>
      </dl>
      <div class="ratings">
        <div class="rating-col">
          <div :class="`rating rating-${campaign}`">Campaign</div>
          <div :class="`rating rating-${arenaDef}`">Arena Def</div>
          <div :class="`rating rating-${arenaOff}`">Arena Off</div>
          <div :class="`rating rating-${clanboss}`">Clanboss</div>
          <div :class="`rating rating-${factionWars}`">F. Wars</div>
        </div>
        <div class="rating-col">
          <div :class="`rating rating-${minotaur}`">Minotaur</div>
          <div :class="`rating rating-${spider}`">Spider</div>
          <div :class="`rating rating-${fireknight}`">Fire Knight</div>
          <div :class="`rating rating-${dragon}`">Dragon's Lair</div>
          <div :class="`rating rating-${icegolem}`">Ice Golem</div>
        </div>
        <div class="rating-col">
          <div :class="`rating rating-${pvoid}`">Void</div>
          <div :class="`rating rating-${pforce}`">Force</div>
          <div :class="`rating rating-${pspirit}`">Spirit</div>
          <div :class="`rating rating-${pmagic}`">Magic</div>
        </div>
      </div>
    </div>
    <div class="skills" v-if="!loading">
      <div class="skill" v-for="skill in skills" :key="skill.name">
        <div class="skill-name">{{ skill.name }}</div>
        <div class="skill-desc">{{ skill.description }}</div>
        <ul class="skill-books">
          <li class="skill-book" v-for="(book, index) in skill.books" :key="index">
            {{ book }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

const elementsWithText = (root: HTMLDivElement, selector: string, text: string | RegExp): HTMLElement[] => {
  const matchedElements = root.querySelectorAll(selector);
  const results: HTMLElement[] = [];
  for (const el of matchedElements) {
    if (el instanceof HTMLElement) {
      if (text instanceof RegExp) {
        if (el.innerText.match(text)) {
          results.push(el);
        }
      } else {
        if (el.innerText === text) {
          results.push(el);
        }
      }
    }
  }
  return results;
};

const nextElementInnerText = (el: HTMLElement | undefined): string => {
  if (el !== null && el !== undefined) {
    const p: HTMLElement = (el.nextElementSibling as HTMLElement) || el;
    return p.innerText;
  }
  return '';
};

const getValueFromText = (text: string, regex: RegExp): string => {
  return (text.match(regex) || []).slice(1).pop() || '';
};

interface ISkill {
  name: string;
  description: string;
  cooldown?: number;
  scaling?: string;
  books: string[];
}

@Component
export default class App extends Vue {
  public x: number = 0;
  public y: number = 0;
  // status
  public loading: boolean = true;
  // overview
  public name: string = '';
  public avatar: string = '';
  public faction: string = '';
  public rarity: string = '';
  public affinity: string = '';
  // stats
  public hp: string = '0';
  public atk: string = '0';
  public def: string = '0';
  public spd: string = '0';
  public crat: string = '0';
  public cdmg: string = '0';
  public res: string = '0';
  public acc: string = '0';
  // ratings
  public campaign: number = 0;
  public arenaDef: number = 0;
  public arenaOff: number = 0;
  public clanboss: number = 0;
  public factionWars: number = 0;
  public minotaur: number = 0;
  public spider: number = 0;
  public fireknight: number = 0;
  public dragon: number = 0;
  public icegolem: number = 0;
  public pvoid: number = 0;
  public pforce: number = 0;
  public pspirit: number = 0;
  public pmagic: number = 0;
  // skills
  public skills: ISkill[] = [];

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public async loadUrl(url: string): Promise<void> {
    this.loading = true;
    const response = await fetch(url);
    this.loading = false;
    if (response.ok) {
      const responseBody = await response.text();
      const start = responseBody.indexOf('>', responseBody.indexOf('<body')) + 1;
      const end = responseBody.indexOf('</body>', start);
      if (!start || !end) {
        throw new Error('Ayumi-Tooltip: Document body could not be read');
      }
      const docTree = document.createElement('div');
      docTree.innerHTML = responseBody.substring(start, end);

      // Find image
      const avatarEl = docTree.querySelector('img[src^="//files.ayumilove.net/games/raid_shadow_legends/avatar/"]');
      this.avatar = (avatarEl) ? (avatarEl.getAttribute('src') || '') : '';
      // Find overview info
      const overviewEl = elementsWithText(docTree, 'h4', 'Overview').pop();
      const overviewText = nextElementInnerText(overviewEl);
      if (overviewText) {
        this.faction = getValueFromText(overviewText, /FACTION: ([^\n]*)/);
        this.rarity = getValueFromText(overviewText, /RARITY: ([^\n]*)/);
        this.affinity = getValueFromText(overviewText, /AFFINITY: ([^\n]*)/);
      }
      // Stats
      const statsEl = elementsWithText(docTree, 'h4', 'Total Stats (6 Stars)').pop();
      const statsText = nextElementInnerText(statsEl);
      if (overviewText) {
        this.hp = getValueFromText(statsText, /Health Points \(HP\): ([^\n]*)/) || '0';
        this.atk = getValueFromText(statsText, /Attack \(ATK\): ([^\n]*)/) || '0';
        this.def = getValueFromText(statsText, /Defense \(DEF\): ([^\n]*)/) || '0';
        this.spd = getValueFromText(statsText, /Speed \(SPD\): ([^\n]*)/) || '0';
        this.crat = getValueFromText(statsText, /Critical Rate \(C.RATE\): ([^\n]*)/) || '0';
        this.cdmg = getValueFromText(statsText, /Critical Damage \(C.DMG\): ([^\n]*)/) || '0';
        this.res = getValueFromText(statsText, /Debuff Resistance \(RESIST\): ([^\n]*)/) || '0';
        this.acc = getValueFromText(statsText, /Debuff Accuracy \(ACC\): ([^\n]*)/) || '0';
      }
      // Ratings
      const ratingText = [
        nextElementInnerText(elementsWithText(docTree, 'h4', 'Grinding').pop()),
        nextElementInnerText(elementsWithText(docTree, 'h4', 'Dungeons').pop()),
        nextElementInnerText(elementsWithText(docTree, 'h4', 'Potion').pop()),
      ].join('\n').split('\n');
      this.campaign = (ratingText.find((t) => t.indexOf('Campaign') !== -1) || '').split('★').length - 1;
      this.arenaDef = (ratingText.find((t) => t.indexOf('Arena Defense') !== -1) || '').split('★').length - 1;
      this.arenaOff = (ratingText.find((t) => t.indexOf('Arena Offense') !== -1) || '').split('★').length - 1;
      this.clanboss = (ratingText.find((t) => t.indexOf('Clan Boss') !== -1) || '').split('★').length - 1;
      this.factionWars = (ratingText.find((t) => t.indexOf('Faction Wars') !== -1) || '').split('★').length - 1;
      this.minotaur = (ratingText.find((t) => t.indexOf('Minotaur') !== -1) || '').split('★').length - 1;
      this.spider = (ratingText.find((t) => t.indexOf('Spider') !== -1) || '').split('★').length - 1;
      this.fireknight = (ratingText.find((t) => t.indexOf('Fire Knight') !== -1) || '').split('★').length - 1;
      this.dragon = (ratingText.find((t) => t.indexOf('Dragon') !== -1) || '').split('★').length - 1;
      this.icegolem = (ratingText.find((t) => t.indexOf('Ice Golem') !== -1) || '').split('★').length - 1;
      this.pvoid = (ratingText.find((t) => t.indexOf('Void Keep') !== -1) || '').split('★').length - 1;
      this.pforce = (ratingText.find((t) => t.indexOf('Force Keep') !== -1) || '').split('★').length - 1;
      this.pspirit = (ratingText.find((t) => t.indexOf('Spirit Keep') !== -1) || '').split('★').length - 1;
      this.pmagic = (ratingText.find((t) => t.indexOf('Magic Keep') !== -1) || '').split('★').length - 1;
      // Skills
      const skillEl = elementsWithText(docTree, 'h2', /^.* Skills$/).pop();
      if (skillEl) {
        this.name = getValueFromText(skillEl.innerText, /^(.*) Skills$/);
        const skillElements: HTMLElement[] = [];
        let node: HTMLElement = skillEl;
        while (node.nextElementSibling && node.nextElementSibling.matches('p')) {
          if (node.nextElementSibling instanceof HTMLElement) {
            skillElements.push(node.nextElementSibling);
            node = node.nextElementSibling;
          } else {
            break;
          }
        }
        this.skills = skillElements.map((el): ISkill => {
          const lines = el.innerText.trim().split('\n').map((str) => str.trim());
          return {
            name: lines[0],
            description: lines[1],
            books: lines.slice(2),
          };
        });
      }
    } else {
      console.error('response not ok', { response });
    }
  }
}
</script>

<style lang="scss" scoped>
.ayumi-tooltip {
  position: fixed;
  z-index: 100000;
  border: solid #000 1px;
  background-color: #333;
  padding: 10px;
  color: #FFF;
  pointer-events: none;
  margin-left: 10px;
  margin-top: -5px;
  max-width: 520px;
}

.character {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

div, p, span, li, dd, dt {
  color: #FFF;
}
ul, li {
  display: block;
  margin: 0;
  padding: 0;
}

.portrait {
  position: relative;
  width: 100px;
  height: 133px;
  margin-right: 5px;

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: solid #CCC 2px;
    z-index: 1;
  }

  .char-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    overflow: hidden;
  }

  .char-name {
    position: absolute;
    display: flex;
    justify-content: space-between;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    padding: 2px 5px;
    background-color: rgba(0, 0, 0, .75);
    color: #FFF;
    font-weight: bold;
    font-size: 10px;

    &::after {
      display: block;
      font-weight: normal;
      font-size: 90%;
      padding-left: 3px;
      text-shadow: 0px 0px 2px rgba(0, 0, 0, 1);
    }
  }

  .faction {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;
    padding-bottom: 5px;
  }
}

.stats {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  padding: 0 10px;

  > div {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    padding: 0 5px;

    dt {
      font-weight: bold;
      color: #EEE;
    }
    dd {
      color: #FFF;
      margin-left: 15px;
    }
  }
}

.ratings {
  display: flex;

  .rating-col + .rating-col {
    margin-left: 10px;
  }

  .rating {
    display: flex;
    align-items: center;
    font-size: 12px;
    &::before {
      font-weight: bold;
      display: inline-block;
      margin: 3px;
      width: 14px;
      height: 14px;
      line-height: 14px;
      text-align: center;
      color: #000;
      border-radius: 3px;
    }
  }

  .rating-1 {
    color: #F66;
    &::before { background-color: #F66; content: '1'; }
  }
  .rating-2 {
    color: #F93;
    &::before { background-color: #F93; content: '2'; }
  }
  .rating-3 {
    color: #FF0;
    &::before { background-color: #FF0; content: '3'; }
  }
  .rating-4 {
    color: #CF3;
    &::before { background-color: #CF3; content: '4'; }
  }
  .rating-5 {
    color: #6F6;
    &::before { background-color: #6F6; content: '5'; }
  }
}

.skill {
  background-color: #222;
  border: solid #666 1px;
  padding: 2px;
  .skill-name {
    font-weight: bold;
    font-size: 12px;
  }
  .skill-desc {
    font-style: italic;
    font-size: 11px;
  }
  .skill-book {
    font-size: 10px;

    &::before {
      display: inline-block;
      content: '-';
      margin-right: 4px;
    }
  }

  + .skill {
    margin-top: 5px;
  }
}

.affinity {
  &-Magic {
    .char-name {
      &::after {
        content: '(magic)';
        color: #39F;
      }
    }
  }
  &-Force {
    .char-name {
      &::after {
        content: '(force)';
        color: #F66;
      }
    }
  }
  &-Spirit {
    .char-name {
      &::after {
        content: '(spirit)';
        color: #6F6;
      }
    }
  }
  &-Void {
    .char-name {
      &::after {
        content: '(void)';
        color: #96F;
      }
    }
  }
}

.rarity {
  &-Uncommon .portrait::before {
    border-color: #6F6;
  }
  &-Rare .portrait::before {
    border-color: #39F;
  }
  &-Epic .portrait::before {
    border-color: #96F;
  }
  &-Legendary .portrait::before {
    border-color: #FF3;
    outline: solid #FF3 1px;
    outline-offset: 2px;
  }
}

</style>
