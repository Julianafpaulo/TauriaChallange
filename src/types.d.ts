export type Room = {
    name: string,
    guid: string,
    host: string,
    participants: string[],
    capacity: number
};

export type User = {
    id: string,
    pass: string,
    mobile_token?: string
};