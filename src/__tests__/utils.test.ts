import { validUUID } from './utils'; 

describe('validUUID()', () => {
    it('matches a valid v4 UUID', () => {
        const v4 = '9ddd2483-3071-498d-bd4e-0fe9c0b2fa94'; 
        const v4Upper = '06FDAF8D-9905-4DA7-B94D-7BA3532D3953'; 
        expect(validUUID(v4)).toBeTruthy(); 
        expect(validUUID(v4Upper)).toBeTruthy(); 
    }); 

    it('doesn\'t match an invalid v4 UUID', () => {
        const v1 = '63955E30-B5DE-11E7-8F1A-0800200C9A66'; 
        const randStr = 'ZUBikEKpzoD7XOdo74Ux'; 
        expect(validUUID(v1)).toBeFalsy(); 
        expect(validUUID(randStr)).toBeFalsy(); 
    }); 
}); 