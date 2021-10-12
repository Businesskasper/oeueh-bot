import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import container from "../inversify.config";
import { MessageBroker } from "../message-broker";
import { TYPES } from "../types";
import { IMessageHandler } from "./imessage-handler";
import { MappedResponder } from "./mapped-responder/mapped-responder";
import { TodoResponder } from "./todo-responder/todo-responder";
import { ValorantAgentResponder } from "./valorant-agent-responder/valorant-agent-responder";

@injectable()
export class MessageHandlerService {

    private messageHandlers: IMessageHandler[] = new Array<IMessageHandler>();

    constructor(
        @inject(TYPES.MessageBroker) private messageBroker: MessageBroker,
        @inject(TYPES.ValorantAgentResponder) private valorantAgentResponder: ValorantAgentResponder,
        @inject(TYPES.ValorantAgentResponder) private todoResponder: TodoResponder,
        @inject(TYPES.ResponseMap) private responseMap: Map<string, string>
    ) {
        this.messageHandlers.push(this.valorantAgentResponder, this.todoResponder);

        // Setup mapped responders
        for (let responseKey of Array.from(this.responseMap.keys())) {
            let mappedHandler = container.get<MappedResponder>(TYPES.MappedResponder);
            mappedHandler.setup(responseKey, this.responseMap.get(responseKey));
            this.messageHandlers.push(mappedHandler)
        }
    }

    public registerResponder(): void {
        this.messageHandlers.forEach((handler: IMessageHandler) =>
            this.messageBroker.onMessageReceived$.subscribe((message: Message) => handler.Handle(message))
        )
    }
}