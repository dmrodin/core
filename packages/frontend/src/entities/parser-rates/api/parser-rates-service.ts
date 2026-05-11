import axios from 'axios';

import { parseTajikRatesResponse, TajikRates } from '../model/parser-rates-schemas';

export const ParserRatesService = {
    async getTajikRates(): Promise<TajikRates> {
        const { data } = await axios.get('/api/parser-rates/tajik');
        return parseTajikRatesResponse(data);
    },
};
