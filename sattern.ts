//
//  sattern.ts
//  sattern
//
//  Created by Jacob Sologub on 10/23/19.
//  Copyright (c) 2019 Jacob Sologub
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to 
//  deal in the Software without restriction, including without limitation the 
//  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
//  sell copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in 
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
//  DEALINGS IN THE SOFTWARE.

declare namespace sattern {
    /**
     * Represents an object identifier.
     */
    export type ObjectID = number;

    /**
     * Represents a Base Object.
     */
    export class ObjectBase {
        /**
         * The identifier of this object.
         */
        readonly id?: ObjectID | undefined;
    }

    /**
     * Represents a channel.
     */
    export type Channel = number;

    /**
     * Represents common Sattern settings
     */
    export class Settings {
        /** 
         * The timeout in milliseconds to wait before terminating execution.
         * 
         * The default value is 5.0 milliseconds and is here as a safeguard so 
         * that we don't completely stall the host process. You can change this 
         * to be higher but this will most likely result in audio clicks/pops. 
         * 
         * 5.0 milliseconds should be more than enough time to do any sort of 
         * operation and the internal default value of this property may change 
         * at anytime in the future. Only use this if you know what you're 
         * doing.
        */
       static executionTimeout: number;
    
       /**
        * Whether or not to latch incoming notes.
        * 
        * Defaults to false.
        */
       static latch: boolean;
    }

    /**
     * The main MidiKeyboardState object.
     */
    export const midiKeyboardState: MidiKeyboardState;

    /**
     * Represents a piano keyboard.
     */
    export class MidiKeyboardState extends ObjectBase {
        /**
         * Turns the specified note on.
         * 
         * @param args 
         */
        noteOn (note: Note): void;

        /**
         * Turns the specified note off.
         * 
         * @param args 
         */
        noteOff (note: Note): void;

        /**
         * Turns off any currently-down notes for the specified midi channel. 
         * If you pass 0 for the midi channel, it will turn off all notes on all 
         * channels.
         * 
         * @param args 
         */
        allNotesOff (channel: number): void;
    }

    /**
     * The main Graph object.
     */
    export const graph: Graph;

    /**
     * Represents a set of interconnected node objects through which 
     * audio/midi/osc data flows.
     */
    export class Graph extends ObjectBase {
        /**
         * Adds an object to this graph.
         * 
         * @param object The object to add to this graph.
         * 
         * @returns The identifier of the object that was added or undefined if
         * the object can't be added to the graph.
         * 
         * \`\`\`javascript
         * const sampler = new Sampler();
         * const soulPatch = SOULPatch ("./Reverb.soulpatch");
         * graph.add (sampler);
         * graph.add (soulPatch);
         * \`\`\`
         */
        add (object: GraphNode): ObjectID | undefined;

        /**
         * Returns an object for the specified identifier or undefined if the 
         * object does not exist.
         * 
         * \`\`\`javascript
         * const samplerId = graph.add (new Sampler());
         * const sampler = graph.get (samplerId);
         * \`\`\`
         */
        get (identifier: ObjectID): GraphNode | undefined;

        /**
         * Connects two specified channels of two objects or one specific 
         * channel to another object's channel.
         * 
         * \`\`\`javascript
         * const sampler = new Sampler();
         * graph.add (sampler);
         * 
         * graph.connect (sampler.output, graph.output);
         * \`\`\`
         * 
         * \`\`\`javascript
         * const sampler = new Sampler();
         * graph.add (sampler);
         *
         * graph.connect (sampler.output [0], graph.output [0]);
         * graph.connect (sampler.output [1], graph.output [1]);
         * \`\`\`
         * 
         * @see [[AudioUnit.input]]
         * @see [[AudioUnit.output]]
         * 
         * @see [[Graph.output]]
         */
        connect (source: [ObjectID, Channel][] | [ObjectID, Channel], destination: [ObjectID, Channel][] | [ObjectID, Channel]) : boolean;

        /**
         * The audio output channels of this graph.
         * 
         * @see [[Graph.connect]]
         */
        readonly output: [ObjectID, Channel][];

        /**
         * The graph's MIDI output object.
         */
        readonly midiOut: MidiOut;

        /**
         * The nodes for this graph.
         */
        readonly nodes: GraphNode[];

        /**
         * The midi input for this graph.
         */
        readonly midiIn: [ObjectID, Channel];
    }

    /**
     * Represents a node object that can be added to a [[Graph]].
     */
    export class GraphNode extends ObjectBase {
        /**
         * The identifier of this node.
         */
        readonly id?: ObjectID;
    }

    /**
     * Represents an Audio Unit.
     * 
     * An audio unit object is a generic processor that can generate or process
     * audio signals and or midi messages.
     * 
     * see [[Sampler]], [[MidiOut]], [[OSCReceiver]], [[OSCSender]], 
     * [[SOULPatch]]
     */
    export class AudioUnit extends GraphNode {
        /**
         * The audio input channels of this audio unit.
         */
        readonly input: [ObjectID, Channel][];

        /**
         * The audio output channels of this audio unit.
         */
        readonly output: [ObjectID, Channel][];

        /**
         * The midi input for this audio unit.
         */
        readonly midiIn: [ObjectID, Channel];

        /**
         * The gain for this object.
         * 
         * Defaults to 1.0.
         */
        gain: number;

        /**
         * The dBFS level for this object.
         *
         * Defaults to 0.0
         */
        gainDecibels: number;

        /**
         * The pan for this object.
         * 
         * Defaults to 0.0; -1.0 = left, 0.0 = centre, 1.0 = right.
         */
        pan: number;
    }

    /**
     * Represents a MIDI output.
     */
    export class MidiOut extends AudioUnit {}

    /**
     * Represents a Sampler.
     */
    export class Sampler extends AudioUnit {
        /**
         * Creates a sampler object.
         */
        constructor();

        /**
         * Gets or sets the sounds for this sampler.
         * 
         * @see [[Sound]]
         */
        sounds: Sound[];

        /**
         * Adds a sound or a list of sounds to this sampler.
         * 
         * @see [[Sound]]
         */
        add (sound: Sound | Sound[]): void;
    }

    /**
     * * Represents a set of options for [[Sound]] objects.
     */
    export interface SoundOptions {
        /**
         * The low key for this sound.
         * Defaults to 0.
         */
        lowKey?: number;

        /**
         * The root key for this sound.
         * Defaults to 60.
         */
        rootKey?: number;

        /**
         * The high key for this sound.
         * Defaults to 127.
         */
        highKey?: number;

        /**
         * The low velocity for this sound.
         * Defaults to 0.
         */
        lowVelocity?: number;

        /**
         * The high velocity for this sound.
         * Defaults to 127.
         */
        highVelocity?: number;

        /**
         * The amp velocity tracking for this sound.
         * Range -1.0 - 1.0
         * Defaults to 1.0.
         */
        ampVelocityTracking?: number;

        /**
         * The attack in seconds for this sound.
         * Defaults to 0.0.
         */
        attack?: number;

        /**
         * The hold in seconds for this sound.
         * Defaults to 0.0.
         */
        hold?: number;

        /**
         * The decay in seconds for this sound.
         * Defaults to 0.0.
         */
        decay?: number;

        /**
         * The sustain for this sound.
         * Defaults to 1.0.
         */
        sustain?: number;

        /**
         * The release in seconds for this sound.
         * Defaults to 1.0.
         */
        release?: number;

        /**
         * The start sample for this sound.
         */
        startSample?: number;

        /**
         * The end sample for this sound.
         */
        endSample?: number;
    }

    /**
     * Represents a sampler sound.
     */
    export class Sound extends ObjectBase implements SoundOptions {
        /** 
         * Creates an Sound object with the specified path and an optional 
         * options object. Paths can be absolute or relative to the JavaScript file 
         * being executed.
         * 
         * Throws an exception if the file does not exist at the specified path.
         */
        constructor (path: string, options?: SoundOptions);

        /**
         * The low key for this sound.
         * Defaults to 0.
         */
        lowKey?: number;

        /**
         * The root key for this sound.
         * Defaults to 60.
         */
        rootKey?: number;

        /**
         * The high key for this sound.
         * Defaults to 127.
         */
        highKey?: number;

        /**
         * The low velocity for this sound.
         * Defaults to 0.
         */
        lowVelocity?: number;

        /**
         * The high velocity for this sound.
         * Defaults to 127.
         */
        highVelocity?: number;

        /**
         * The amp velocity tracking for this sound.
         * Range -1.0 - 1.0
         * Defaults to 1.0.
         */
        ampVelocityTracking?: number;

        /**
         * The attack in seconds for this sound.
         * Defaults to 0.0.
         */
        attack?: number;

        /**
         * The hold in seconds for this sound.
         * Defaults to 0.0.
         */
        hold?: number;

        /**
         * The decay in seconds for this sound.
         * Defaults to 0.0.
         */
        decay?: number;

        /**
         * The sustain for this sound.
         * Defaults to 1.0.
         */
        sustain?: number;

        /**
         * The release in seconds for this sound.
         * Defaults to 1.0.
         */
        release?: number;

        /**
         * The start sample for this sound.
         */
        startSample?: number;

        /**
         * The end sample for this sound.
         */
        endSample?: number;

        /**
         * The total number of samples in this sound.
         */
        readonly lengthInSamples: number;

        /**
         * The file path for this sound.
         */
        readonly file: string;

        /**
         * Splits this sound into equal parts or "slices". 
         * 
         * The sounds will be mapped starting from this sound's "rootKey" 
         * property onward retaining the sound's high/low velocity values. So 
         * if you have a sound with a root key of 1 and call slice(10) you will 
         * get back 10 sounds mapped from rootKey 1 through rootKey 10. The 
         * maximum number of slices is 128 (one for each midi note). 
         * 
         * If you have a sound with a root key of 126 and call slice(10) the 
         * root key will wrap around to 0 and you will get back 10 sounds mapped 
         * from rootKey 126 through rootKey 7.
         * 
         * @param slices The number of slices to create.
         */
        slice (slices: number): Sound[];
    }

    /**
     * Represents an OSC Message.
     * 
     * An OSCMessage consists of an address pattern and zero or more arguments.
     * http://opensoundcontrol.org/spec-1_0
     */
    export class OSCMessage extends ObjectBase {
        /**
         * 
         * @param addressPattern An OSC address pattern is an string beginning 
         * with the character '/' (forward slash).
         * 
         * @param arguments An optional list of OSC arguments.
         * 
         * http://opensoundcontrol.org/spec-1_0
         */
        constructor (addressPattern: string, ...args: (number | string | ArrayBuffer)[]);

        /**
         * Returns the addressPattern for this message.
         * 
         * http://opensoundcontrol.org/spec-1_0
         */
        readonly addressPattern: string;

        /**
         * Returns the arguments for this message.
         * 
         * http://opensoundcontrol.org/spec-1_0
         */
        readonly arguments: Array<number | string | ArrayBuffer>;
    }

    /**
     * Represents an OSC receiver.
     * 
     * An OSCReceiver object cam receive OSC messages on a specified UDP port.
     */
    export class OSCReceiver extends AudioUnit {
        /** 
         * Creates an OSC receiver object with a specified UDP port.
         * 
         * @param port The port to listen on for OSC messages.
         * 
         * Throws an exception if the port is in use and or a connection cannot
         * be established.
         */
        constructor (port: number);

        /**
         * Returns the UDP port for this object.
         */
        readonly port: number;

        /**
         * Gets or sets the message received callback for this object.
         */
        onMessageReceived?: (message: OSCMessage) => void;
    }

    /**
     * Represents an OSC sender.
     * 
     * An OSCSender object can send OSC messages to a specified host over UDP 
     * socket.
     */
    export class OSCSender extends AudioUnit {
        /**
         * Creates an OSCSender object with a specified hostname and port.
         * 
         * @param hostname The remote host to which messages will be send.
         * @param port The remote UDP port number.
         * 
         * Throws an exception if the connection cannot be established for the 
         * specified hostname and port.
         */
        constructor (hostname: string, port: number);

        /**
         * Returns hostname for this object.
         */
        readonly hostname: string;

        /**
         * Returns the UDP port for this object.
         */
        readonly port: number;
    }

    /**
     * @beta
     * Represents a SOUL patch.
     * 
     * https://soul.dev/
     */
    export class SOULPatch extends AudioUnit {
        /** 
         * Creates an SOUL patch object with the specified path. Paths can be 
         * absolute or relative to the JavaScript file being executed.
         * 
         * Throws an exception if the file does not exist at the specified path.
         */
        constructor (path: string);

        /**
         * Gets or sets the SOUL patch parameters. These values are only 
         * available after the SOUL patch has been successfully loaded. You can
         * get/set new parameter values in any [[Pattern]] callback.
         * 
         * Usually parameters are sent with each step inside the 
         * [[Pattern.onSequence]] callback and this is here for that one special 
         * case where you'd want to set parameters directly from a 
         * [[Pattern.controllerMoved]], [[Pattern.aftertouchChanged]] or other
         * callback(s) that do not allow adding steps.
         */
        parameters?: Map<string, number>;
    }

    /**
     * Represents a set of options for [[Pattern]] objects.
     */
    export interface PatternOptions {
        /**
         * The name for this pattern.
         */
        name?: string;

        /**
         * Whether or not this pattern should cycle.
         * Defaults to true.
         */
        cycle?: boolean;

        /**
         * The offset for this pattern. If the offset value is greater than 
         * zero then the steps will be shifted to the right by the offset 
         * amount. If the offset value is less than zero then the steps will be
         * shifted to the left.
         * 
         * \`\`\`javascript
         * let steps = [step1, step2, step3];
         * this.offset = 1;
         * // [step3, step1, step2]
         * \`\`\`
         * \`\`\`javascript
         * let steps = [step1, step2, step3];
         * this.offset = -1;
         * // [step3, step2, step1]
         * \`\`\`
         * 
         * Defaults to 0.
         */
        offset?: number;

        /**
         * Whether or not this pattern is reversed.
         */
        reversed?: boolean;

        /**
         * The key range for this pattern. 
         * Defaults to [0, 127]
         */
        keyRange?: [number, number];

        /**
         * The velocity range for this pattern. 
         * Defaults to [0, 127]
         */
        velocityRange?: [number, number];

        /**
         * The clock multiplier for this pattern. 
         * Defaults to 1.0.
         */
        clockMultiplier?: number;

        /**
         * Whether or not to re-sequence this pattern once it reaches the end. 
         * If this is set to false then [[Pattern.onSequence]] callback will not 
         * be called and the last sequence of steps will be used again. If this 
         * is set to true (default) then the [[Pattern.onSequence]] callback will 
         * be called when this pattern reaches the end to get a new set of steps 
         * for the sequence.
         * 
         * Defaults to true.
         */
        resequence?: boolean;

        /**
         * The sequence callback for this pattern.
         * 
         * This callback is triggered when a note on is received and should 
         * return a [[Step]] or a list of [[Step]]s. This callback will be 
         * called repeatably while a note is held down in the key/velocity range 
         * of this pattern, while there are 1 or more steps, 
         * [[Pattern.resequence]] is set to true (default) and if 
         * [[Pattern.cycle]] is set to true (default).
         * 
         * @see [[Step]]
         */
        onSequence?: (context: Pattern.Context) => Step | Step[];

        /**
         * The advanced callback for this pattern. 
         * 
         * This callback is called when this pattern progresses to a new step.
         */
        onAdvanced?: (context: Pattern.Context) => void;

        /**
         * The ended callback for this pattern. 
         * 
         * This callback is called when this pattern reaches the end of the 
         * last step.
         */
        onEnded?: (context: Pattern.Context) => void;

        /**
         * The controller moved callback for this pattern.
         */
        onControllerMoved?: (context: Pattern.Context) => void;

        /**
         * The pitch wheel moved callback for this pattern.
         */
        onPitchWheelMoved?: (context: Pattern.Context) => void;

        /**
         * The after touch changed callback for this pattern.
         */
        onAfterTouchChanged?: (context: Pattern.Context) => void;

        /**
         * The channel pressure changed callback for this pattern.
         */
        onChannelPressureChanged?: (context: Pattern.Context) => void;

        /**
         * The note on callback for this pattern. 
         */
        onNoteOn?: (context: Pattern.Context) => void;

        /**
         * The note off callback for this pattern. 
         */
        onNoteOff?: (context: Pattern.Context) => void;

        /**
         * Represents the visualisation method to use for this pattern. The 
         * default visualisation method is [Pattern.Visualisation.automatic]
         */
        visualisation?: Pattern.Visualisation;
    }

    /**
     * Represents a Pattern
     * 
     * A pattern object is a special kind of voice that can generate steps that 
     * trigger some kind of target object(s) with some kind of message/data.
     */
    export class Pattern extends ObjectBase implements PatternOptions {
        /**
         * Creates a pattern object with the specified options.
         */
        constructor (options?: PatternOptions);

        /**
         * Creates a pattern object with the specified name.
         */
        constructor (name?: string);
        
        /**
         * Creates a pattern object.
         */
        constructor();

        /**
         * The name for this pattern.
         */
        name?: string;

        /**
         * Whether or not this pattern should cycle.
         * Defaults to true.
         */
        cycle?: boolean;

        /**
         * The key range for this pattern. 
         * Defaults to [0, 127]
         */
        keyRange?: [number, number];

        /**
         * The velocity range for this pattern. 
         * Defaults to [0, 127]
         */
        velocityRange?: [number, number];

        /**
         * The clock multiplier for this pattern. 
         * Defaults to 1.0.
         */
        clockMultiplier?: number;

        /**
         * Whether or not to re-sequence this pattern once it reaches the end. 
         * If this is set to false then [[Pattern.onSequence]] callback will not 
         * be called and the last sequence of steps will be used again. If this 
         * is set to true (default) then the [[Pattern.onSequence]] callback will 
         * be called when this pattern reaches the end to get a new set of steps 
         * for the sequence.
         * 
         * Defaults to true.
         */
        resequence?: boolean;

        /**
         * The sequence callback for this pattern.
         * 
         * This callback is triggered when a note on is received and should 
         * return a [[Step]] or a list of [[Step]]s. This callback will be 
         * called repeatably while a note is held down in the key/velocity range 
         * of this pattern, while there are 1 or more steps, 
         * [[Pattern.resequence]] is set to true (default) and if 
         * [[Pattern.cycle]] is set to true (default).
         * 
         * @see [[Step]]
         */
        onSequence?: (context: Pattern.Context) => Step | Step[];

        /**
         * The advanced callback for this pattern. 
         * 
         * This callback is called when this pattern progresses to a new step.
         */
        onAdvanced?: (context: Pattern.Context) => void;

        /**
         * The ended callback for this pattern. 
         * 
         * This callback is called when this pattern reaches the end of the 
         * last step.
         */
        onEnded?: (context: Pattern.Context) => void;

        /**
         * The controller moved callback for this pattern.
         */
        onControllerMoved?: (context: Pattern.Context) => void;

        /**
         * The pitch wheel moved callback for this pattern.
         */
        onPitchWheelMoved?: (context: Pattern.Context) => void;

        /**
         * The after touch changed callback for this pattern.
         */
        onAfterTouchChanged?: (context: Pattern.Context) => void;

        /**
         * The channel pressure changed callback for this pattern.
         */
        onChannelPressureChanged?: (context: Pattern.Context) => void;

        /**
         * The note on callback for this pattern. 
         */
        onNoteOn?: (context: Pattern.Context) => void;

        /**
         * The note off callback for this pattern. 
         */
        onNoteOff?: (context: Pattern.Context) => void;

        /**
         * Represents the visualisation method to use for this Pattern's voices. 
         * The default visualisation method is [Pattern.Visualisation.automatic]
         */
        visualisation?: Pattern.Visualisation;
    }

    export namespace Pattern {
        /**
         * Represents a pattern context.
         */
        export class Context {
            /**
             * The current note object.
             * 
             * @see [[Note]]
             */
            readonly note: Note | undefined;

            /**
             * Whether this note is a note on message. 
             * Defaults to false.
             */
            readonly isNoteOn: boolean;

            /**
             * The current controller object.
             * 
             * @see [[Controller]]
             */
            readonly controller: Controller | undefined;;

            /**
             * The current pitch bend object.
             * 
             * @see [[PitchBend]]
             */
            readonly pitchBend: PitchBend | undefined;

            /**
             * The current after touch object.
             * 
             * @see [[Aftertouch]]
             */
            readonly aftertouch: Aftertouch | undefined;

            /**
             * The current after channel pressure object.
             * 
             * @see [[ChannelPressure]]
             */
            readonly channelPressure: ChannelPressure | undefined;

            /**
             * The number of times the pattern has played from beginning to end.
             * Defaults to 0.
             */
            readonly count: number;
        }

        /**
         * Represents the visualisation method for a pattern's voices.
         */
        export class Visualisation {
            /**
             * The default visualisation method. 
             * 
             * Steps will be shown on the Pattern visualizer if more than one 
             * step with a non-undefined target is returned from 
             * [Pattern.onSequence].
             */
            static readonly automatic: number;
            
            /**
             * Steps will be shown on the Pattern visualizer if more than one 
             * step is returned from [Pattern.onSequence].
             */
            static readonly always: number;

            /**
             * Steps will be never be shown on the Pattern visualizer.
             */
            static readonly never: number;
        }
    }

    /**
     * Adds a Pattern.
     * 
     * @param pattern The pattern to add.
     * 
     * @returns The identifier of the pattern that was added or undefined if
     * the object can't be added.
     */
    export function add (pattern: Pattern): ObjectID | undefined;

    /**
     * Returns a Pattern object for the specified identifier or undefined if 
     * the object does not exist.
     */
    export function get (identifier: ObjectID): Pattern | undefined;

    /**
     * Represents a MIDI message.
     */
    export class MidiMessage extends ObjectBase {
        /**
         * The channel for this MIDI message.
         */
        channel: number | 1;
    }

    /**
     * Represents an Aftertouch
     */
    export class Aftertouch extends MidiMessage {
        /**
         * Creates an after-touch object with the specified values.
         * 
         * @param key The key for this aftertouch message, defaults to 0.
         * @param amount The amount for this aftertouch message, defaults to 0.
         * @param channel The channel for this aftertouch message, defaults to 1.
         */
        constructor (key?: number, amount?: number, channel?: number);

        /**
         * The key for this after-touch
         */
        key: number | 0;

        /**
         * The amount for this after-touch
         */
        amount: number | 0;
    }

    /**
     * Represents a ChannelPressure
     */
    export class ChannelPressure extends MidiMessage {
        /**
         * Creates a channel pressure object with the specified values.
         * 
         * @param pressure The pressure value for this channel pressure message,
         * defaults to 0.
         * @param channel The channel for this channel pressure message, 
         * defaults to 1.
         */
        constructor (pressure?: number, channel?: number);

        /**
         * The pressure for this after-touch
         */
        pressure: number | 0;
    }

    /**
     * Represents a Controller.
     */
    export class Controller extends MidiMessage {
        /**
         * Creates a controller object with the specified values.
         * 
         * @param number The controller number for this controller message, 
         * defaults to 1.
         * @param value The value for this controller message, defaults to 0.
         * @param channel The channel for this channel pressure message, 
         * defaults to 1.
         */
        constructor (number?: number, value?: number, channel?: number);

        /**
         * The number for this controller.
         */
        number: number | 1;

        /**
         * The value for this controller.
         */
        value: number | 0;
    }

    /**
     * Represents a Note.
     */    
    export class Note extends MidiMessage {
        /**
         * Creates a note object with the specified values.
         * 
         * @param key The key for this note message, defaults to 0.
         * @param velocity The velocity for this note message, defaults to 127.
         * @param channel The channel for this channel pressure message, 
         * defaults to 1.
         */
        constructor (key?: number, velocity?: number, channel?: number);

        /**
         * The key for this note
         */
        key: number | 0;

        /**
         * The velocity for this note
         */
        velocity: number | 127;

        /**
         * Returns true if this Note is a "note on" message.
         */
        readonly on: boolean;
    }

    export class PitchBend extends MidiMessage {
        /**
         * Creates a pitch bend object with the specified values.
         * 
         * @param value The value for this pitch bend message. The range of 
         * this value is 0 - 16383. Defaults to 8192
         * @param channel The channel for this channel pressure message, 
         * defaults to 1.
         */
        constructor (value?: number, channel?: number);

        /**
         * The value for this pitch bend. The range of this value is 0 - 16383. 
         * Defaults to 8192 - no pitch bend.
         */
        value: number;

        /**
         * The minimum value 0 for a pitch bend.
         */
        static readonly min: number;

        /**
         * The maximum value 16383 for a pitch bend.
         */
        static readonly max: number;

        /**
         * The "none" value 8192 for pitch bend.
         */
        static readonly none: number;
    }

    export namespace Step {
        export type MapType = Map<AudioUnit | undefined | Array<AudioUnit | undefined>, MidiMessage | OSCMessage | Object | Array<MidiMessage | OSCMessage | Object>>;
        export type ArrayType = Array<[AudioUnit | undefined, MidiMessage | OSCMessage | Object] | [Array<AudioUnit | undefined>, Array<MidiMessage | OSCMessage | Object>]>;
    }

    export class Step extends ObjectBase {
        /**
         * Creates a step object with the specified values.
         * 
         * @param map A Map object specifying the "mapping" for this step or an 
         * [[Array]] that should be of length (size * 2), where index N is the 
         * Nth key and index N + 1 is the Nth value.
         * @param duration The length of the step in clock cycles "ppq".
         * @param gate The length of the gate in clock cycles "ppq".
         * 
         * See [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
         * 
         * The keys for this map can be any target-able object i.e. a Sampler, 
         * MidiOut, OSCSender, etc. or a list[] of any target-able objects.
         * 
         * The values for this can be any message type objects i.e. Note,
         * Controller, PitchBend, Object or a list[] of any message type 
         * objects.
         * 
         * \`\`\`javascript
         * // Using a Map<>
         * 
         * // send a Note to one sampler, with duration of 4 and a gate of 2.
         * const map = new Map();
         * map.set (sampler1, new Note (64));
         * const step = new Step (map, 4, 2);
         * 
         * // send a Note to two samplers, with duration of 4 and a gate of 2.
         * const map = new Map();
         * map.set ([sampler1, sampler2], new Note (64));
         * const step = new Step (map, 4, 2);
         * 
         * // send two Notes to one sampler, with duration of 4 and a gate of 2.
         * const map = new Map();
         * map.set (sampler1, [new Note (64), new Note (67)]);
         * const step = new Step (map, 4, 2);
         * 
         * // send two Notes to two samplers, with duration of 4 and a gate of 2.
         * const map = new Map();
         * map.set ([sampler1, sampler2], [new Note (64), new Note (67)]);
         * const step = new Step (map, 4, 2);
         * 
         * // send one Note to a sampler and a midi output, with duration of 4 and a gate of 2.
         * const map = new Map();
         * map.set ([sampler1, graph.midiOut], new Note (64));
         * const step = new Step (map, 4, 2);
         *
         * 
         * // Using an Array
         * 
         * // send a Note to one sampler, with duration of 4 and a gate of 2.
         * const array = new Array();
         * array.push (sampler1, new Note (64));
         * const step = new Step (array, 4, 2);
         * 
         * // send a Note to two samplers, with duration of 4 and a gate of 2.
         * const step = new Step ([[sampler1, sampler2], new Note (64)], 4, 2);
         * 
         * // send two Notes to one sampler, with duration of 4 and a gate of 2.
         * const step = new Step ([sampler1, [new Note (64), new Note (67)]], 4, 2);
         * 
         * // send two Notes to two samplers, with duration of 4 and a gate of 2.
         * const step = new Step ([[sampler1, sampler2], [new Note (64), new Note (67)]], 4, 2);
         * 
         * // send one Note to a sampler and a midi output, with duration of 4 and a gate of 2.
         * const step = new Step ([[sampler1, graph.midiOut], new Note (64)], 4, 2);
         * \`\`\`
         */

        constructor (map?: Step.MapType | Step.ArrayType, duration?: number, gate?: number);

        /**
         * The duration for this step.
         * Defaults to 4.
         */
        duration: number;

        /**
         * The gate for this step.
         * Defaults to 4 | duration.
         */
        gate: number;

        /**
         * The map objet for this step.
         */
        map: Step.MapType;
    }

    /**
     * Represents a Controller.
     */
    export class File extends ObjectBase {
        /** 
         * Creates a File object for the specified path. Paths can be absolute 
         * or relative to the JavaScript file being executed.
         * 
         * Throws an exception if the file does not exist at the specified path.
         */
        constructor (path: string);

        /**
         * Reads a file into memory as a string.
         */
        loadFileAsString(): string;

        /**
         * Loads a file's contents into memory as a block of binary data.
         */
        loadFileAsData(): ArrayBuffer;
    }

    /**
     * The main controller moved callback.
     */
    export var onControllerMoved: (controller: Controller) => void;

    /**
     * The main pitch wheel moved callback.
     */
    export var onPitchWheelMoved: (pitchBend: PitchBend) => void;

    /**
     * The main after touch changed callback.
     */
    export var onAftertouchChanged: (afterTouch: Aftertouch) => void;

    /**
     * The main channel pressure changed callback.
     */
    export var onChannelPressureChanged: (channelPressure: ChannelPressure) => void;

    /**
     * The main note on callback.
     */
    export var onNoteOn: (note: Note) => void;

    /**
     * The main note off callback.
     */
    export var onNoteOff: (note: Note) => void;

} // namespace sattern
