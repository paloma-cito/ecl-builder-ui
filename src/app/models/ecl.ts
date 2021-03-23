export class ECLExpression {
    operator: string;
    conceptId: string;
    wildcard: boolean;
    term: string;
    fullTerm: string;

    constructor(operator?, conceptId?, wildcard?, term?, fullTerm?) {
        this.operator = operator;
        this.conceptId = conceptId;
        this.wildcard = wildcard;
        this.term = term;
        this.fullTerm = fullTerm;
    }
}

export class ECLConjunctionExpression {
    conjunctionExpressionConstraints: ECLExpression[];

    constructor(conjunctionArray) {
        this.conjunctionExpressionConstraints = conjunctionArray;
    }
}

export class ECLDisjunctionExpression {
    disjunctionExpressionConstraints: ECLExpression[];

    constructor(disjunctionArray) {
        this.disjunctionExpressionConstraints = disjunctionArray;
    }
}

export class ECLExpressionWithRefinement {
    subexpressionConstraint: ECLExpression;
    eclRefinement: EClRefinement;

    constructor(subexpressionConstraint, eclRefinement) {
        this.subexpressionConstraint = subexpressionConstraint;
        this.eclRefinement = eclRefinement;
    }
}

export class EClRefinement {
    subRefinement: SubRefinement;

    constructor(subRefinement) {
        this.subRefinement = subRefinement;
    }
}

export class SubRefinement {
    eclAttributeSet: EClAttributeSet;

    constructor(eclAttributeSet) {
        this.eclAttributeSet = eclAttributeSet;
    }
}

export class EClAttributeSet {
    subAttributeSet: SubAttributeSet;
    conjunctionAttributeSet?: SubAttributeSet[];
    disjunctionAttributeSet?: SubAttributeSet[];

    constructor(subAttributeSet, conjunctionAttributeSet?, disjunctionAttributeSet?) {
        this.subAttributeSet = subAttributeSet;
        this.conjunctionAttributeSet = conjunctionAttributeSet;
        this.disjunctionAttributeSet = disjunctionAttributeSet;
    }
}

export class SubAttributeSet {
    attribute: Attribute;

    constructor(attribute) {
        this.attribute = attribute;
    }
}

export class Attribute {
    attributeName: ECLExpression;
    expressionComparisonOperator: string;
    value: ECLExpression;
    reverse: boolean;
    cardinalityMin: number;

    constructor(attributeName, expressionComparisonOperator, value, reverse, cardinalityMin) {
        this.attributeName = attributeName;
        this.expressionComparisonOperator = expressionComparisonOperator;
        this.value = value;
        this.reverse = reverse;
        this.cardinalityMin = cardinalityMin;
    }
}
