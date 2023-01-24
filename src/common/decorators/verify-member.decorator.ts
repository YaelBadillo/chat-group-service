import { applyDecorators, UseGuards } from '@nestjs/common';

import { VerifyMemberGuard } from '../guard';

export const VerifyMember = () => applyDecorators(UseGuards(VerifyMemberGuard));
