export class FreezingException {
    public message!: string;
    public name = 'FreezingException';

    constructor(message: string) {
        this.message = message;
    }
}