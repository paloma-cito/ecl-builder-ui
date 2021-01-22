export class Ecl {
    subexpressionConstraint: {
        operator: string,
        conceptId: string,
        term: string,
        wildcard: boolean
    };
    eclRefinement: {
        subRefinement: {
            eclAttributeSet: {
                subAttributeSet: AttributeSet
                conjunctionAttributeSet: AttributeSet[]
            }
        }
        conjunctionSubRefinements: AttributeSet[]
    };

    constructor() {
        this.subexpressionConstraint = {
            operator: '',
            conceptId: '',
            term: '',
            wildcard: false
        };
        this.eclRefinement = {
            subRefinement: {
                eclAttributeSet: {
                    subAttributeSet: new AttributeSet(),
                    conjunctionAttributeSet: [new AttributeSet()]
                }
            },
            conjunctionSubRefinements: [new AttributeSet()]
        };
    }
}

export class AttributeSet {
    attribute: {
        attributeName: {
            conceptId: string,
            term: string,
            wildcard: boolean
        };
        expressionComparisonOperator: string,
        value: {
            operator: string,
            conceptId: string,
            term: string,
            wildcard: boolean
        };
        reverse: boolean,
        cardinalityMin: number
    };

    constructor() {
        this.attribute = {
            attributeName: {
                conceptId: '',
                term: '',
                wildcard: false
            },
            expressionComparisonOperator: '',
            value: {
                operator: '',
                conceptId: '',
                term: '',
                wildcard: false
            },
            reverse: false,
            cardinalityMin: 1
        };
    }
}
