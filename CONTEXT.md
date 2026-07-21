# terminal-typing

terminal-typing is a practice environment for learning command entry and keyboard workflows used in command-line shells.

## Language

**Shell**:
A command-line environment whose commands and keyboard workflows a learner practices. The initial shells are PowerShell, Bash, and Zsh.
_Avoid_: Terminal, console

**Terminal**:
The interactive text interface in which a shell session appears.
_Avoid_: Shell

**Input Buffer**:
The editable command text at the current shell prompt, which may span multiple lines. Previously produced terminal output is not part of the input buffer and cannot be edited.
_Avoid_: Terminal transcript, code editor document

**Simulated Shell**:
A safe model of a shell that recognizes supported commands and keyboard workflows without executing operating-system commands. Its behavior and relevant output resemble the selected shell, while presentation omits machine-specific clutter and does not claim full emulation.
_Avoid_: Sandbox, virtual machine, real shell

**Lesson**:
A challenge pool that develops a particular skill for one shell and binding profile. Starting the lesson creates a randomized lesson run.
_Avoid_: Course, module

**Challenge Pool**:
The reviewed challenges available to a lesson. A lesson run selects from this pool and avoids recently presented challenges when alternatives exist.
_Avoid_: Fixed lesson sequence

**Lesson Run**:
A randomized selection and ordering of challenges from one lesson's challenge pool. Its seed remains stable only during the active visit; leaving or refreshing discards the run, and returning starts fresh. Retrying an individual challenge preserves it, while practicing the lesson again creates a new run.
_Avoid_: Lesson, fixed playlist

**Lesson Completion**:
Finishing every challenge selected for one lesson run. Completion is retained even when the lesson's challenge pool later grows.
_Avoid_: Exhausting the challenge pool

**Pool Coverage**:
The number of distinct challenges in a lesson's pool that a learner has practiced. It measures breadth independently of lesson completion.
_Avoid_: Lesson completion

**Related Skill**:
The same general capability as expressed through separate shell-specific lesson variants.
_Avoid_: Universal lesson

**Curriculum**:
The bundled, reviewed collection of lessons supplied with the app. Learner-created and imported lessons are outside the initial product.
_Avoid_: User content, arbitrary script

**Scenario**:
The starting terminal state, supported keyboard actions, state transitions, and desired outcome that define a challenge.
_Avoid_: Full shell environment

**Virtual Workspace**:
An isolated, resettable collection of simulated files and directories used by a scenario. It has no relationship to a learner's real filesystem.
_Avoid_: Local folder, mounted directory, sandboxed real files

**Keyboard-first**:
A product principle requiring every learning flow to be fully operable from the keyboard while retaining pointer and touch access. Pointer use outside the simulated terminal does not affect challenge completion or score.
_Avoid_: Keyboard-only, pointer-disabled

**Command Lesson**:
A lesson focused on recalling and accurately entering shell commands. Normal mode shows the exact command and its meaning; hard mode shows only the starting state and desired outcome.

**Efficiency Lesson**:
A lesson focused on choosing fast keyboard actions for navigation, editing, history, completion, and execution. Normal mode shows the recommended key chord and action name; hard mode shows only the starting state and desired outcome. Elapsed time measures mastery but does not define the lesson type.
_Avoid_: Speed lesson

**Challenge**:
The smallest scored unit of practice: a goal completed through one or more keyboard actions in a simulated shell.
_Avoid_: Question, exercise

**Challenge Revision**:
A version of a challenge's scenario or scoring behavior. Completion history may span revisions, but personal-best comparisons do not cross materially different revisions.
_Avoid_: New challenge identity

**Keyboard Action**:
A command, shortcut, or text-editing operation used to make progress toward a challenge goal.
_Avoid_: Command when referring to every kind of action

**Shell Command**:
Syntax, a built-in operation, or a ubiquitous core utility used in everyday shell work, including navigation, file inspection, redirection, variables, history, and completion.
_Avoid_: Developer tool command

**Core Utility**:
A commonly available command used for fundamental shell work, such as listing, creating, or reading files. Core utilities may be taught in the initial shell curriculum even when they are separate executables.
_Avoid_: Separately installed developer tool

**Tool Command**:
A command provided by a separately installed developer tool such as Git, Docker, or npm. Tool commands belong to separately labeled curricula rather than the initial shell curriculum.
_Avoid_: Shell command

**Hard Mode**:
A freely selectable challenge presentation that shows the desired outcome without revealing the recommended keyboard action. It defaults off, is never gated by progress, and the learner's explicit preference may be retained locally.
_Avoid_: Separate lesson type

**Binding Profile**:
The named set of keyboard actions a simulated shell recognizes. The initial profiles are Emacs-style bindings for Bash and Zsh and Windows PSReadLine bindings for PowerShell.
_Avoid_: Universal shortcuts

**Compatible Binding**:
A binding that the learner's current browser and operating system can capture safely and reliably. Incompatible bindings may be explained but are not remapped or used in scored challenges.
_Avoid_: Remapped shortcut

**Practice-capable Device**:
A device with a physical keyboard and a browser capable of capturing the bindings required by a challenge. Other devices may browse learning content but do not run scored attempts.
_Avoid_: Desktop-only device

**Learning Glossary**:
Learner-facing explanations of shell concepts, keyboard actions, and distinctions such as shell versus terminal or Emacs-style versus PSReadLine bindings.
_Avoid_: Project glossary, documentation dump

**Coaching Feedback**:
Plain-language guidance shown separately from authentic simulated-shell output. In hard mode it remains hidden until requested or the attempt ends.
_Avoid_: Shell output

**Feedback Mode**:
A locally retained learner preference that controls whether a lesson run pauses for detailed results and coaching after each challenge. When off, the run briefly confirms completion and advances to an untimed ready state; full results remain available in the run summary or through a keyboard action.
_Avoid_: Hard mode

**Challenge Completion**:
Reaching a challenge's desired terminal state through any supported sequence of keyboard actions.
_Avoid_: Matching the recommended sequence

**Challenge Score**:
Activity-specific feedback reported as separate metrics rather than a composite number: command lessons show time, corrections, and incorrect submissions; efficiency lessons show time, unsupported or incorrect actions, and excess actions; warm-ups show words per minute and character accuracy.
_Avoid_: Pass/fail result

**Accuracy**:
An activity-specific error measure: character accuracy for warm-ups, corrections and incorrect submissions for command lessons, and unsupported actions and incorrect submissions for efficiency lessons. Extra valid actions affect action efficiency, not accuracy.
_Avoid_: Conformance to the recommended sequence

**Assist**:
Input or an interruption that prevents an attempt from fully demonstrating the targeted skill. An assisted attempt may complete a challenge but cannot establish a best score; paste is an assist unless clipboard use is the skill being taught, revealing a hard-mode hint is always an assist, and leaving the active tab pauses and assists the attempt.
_Avoid_: Failure, cheating

**Attempt**:
A count-up timed run of a challenge with no time limit. The scenario and timer begin together after an explicit keyboard start, so setup and surrounding lesson reading are excluded.
_Avoid_: Page visit, practice session

**Warm-up**:
A traditional transcription activity using text and punctuation frequently encountered in shell work, such as commands, paths, flags, URLs, and symbols. It is optional, scored by typing speed and character accuracy, and independent of lesson progress.
_Avoid_: Command lesson, efficiency lesson

**Warm-up Prompt**:
A reproducible transcription sample assembled from a curated local corpus using a seed.
_Avoid_: Random characters, runtime-generated AI text

**Recommended Sequence**:
An efficient sequence of keyboard actions taught by a challenge. It is guidance and a scoring benchmark, not the only valid solution.
_Avoid_: Required sequence, correct sequence

**Learning Progress**:
A learner's locally retained challenge completions, best scores, and preferences. It guides recommendations but never restricts lesson access; it may be reset explicitly and is permanently lost when the relevant browser data is cleared.
_Avoid_: Account, enrollment, unlock state

**Personal Best**:
The learner's best locally retained value for an individual metric from an unassisted completed attempt. Different attempts may hold the records for different metrics.
_Avoid_: Composite high score, winning attempt

**Theme**:
A light or dark visual presentation that defaults to the learner's system preference and may be overridden by a locally retained choice.
_Avoid_: Terminal color scheme
