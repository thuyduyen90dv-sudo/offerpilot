import {writeFileSync} from 'node:fs';
import {createDocx} from '../src/documents.js';
import {seed} from '../src/domain.js';
writeFileSync('tests/fixtures/resume.docx',createDocx(seed().resume));
