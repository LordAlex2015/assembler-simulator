class FileToTranslate:
    def __init__(self, src, dst, transformation):
        self.src = src
        self.dst = dst
        self.transformation = transformation

    def transform(self):
        self.transformation(self.src, self.dst)

        linesToIgnore = {
            "val": "app.service",
            "onlyOnce": True,
            "visited": False
        },


class LinesToIgnoreMetadata:
    def __init__(self, onlyOnce):
        self.onlyOnce = onlyOnce
        self.visited = False


def main():
    def translator_generator(linesBefore, linesAfter, linesToIgnore, lastLine, linesToModify):
        def tailored_translator(src, dst):
            sourceFile = open(src, "r")
            dstFile = open(dst, "w")
            for l in linesBefore:
                dstFile.write(l)
            for l in sourceFile:
                if any((match := ignore) in l for ignore in linesToIgnore.keys()):
                    if not linesToIgnore[match].onlyOnce:
                        pass
                    else:
                        if not linesToIgnore[match].visited:
                            linesToIgnore[match].visited = True
                        else:
                            dstFile.write(l)

                elif any((match := modify) in l for modify in linesToModify.keys()):
                    dstFile.write(linesToModify[match])
                elif lastLine["val"] in l:
                    if (lastLine["shouldWrite"]):
                        dstFile.write(l)
                    break
                else:
                    dstFile.write(l)
            for l in linesAfter:
                dstFile.write(l)
        return tailored_translator

    translate_memory = translator_generator(
        linesBefore=[],
        linesAfter=["module.exports = { memory };"],
        linesToIgnore={
            "app.service": LinesToIgnoreMetadata(True)
        },
        lastLine={"val": "memory.reset();", "shouldWrite": True},
        linesToModify={})

    translate_cpu = translator_generator(
        linesBefore=[],
        linesAfter=["module.exports = { cpu };"],
        linesToIgnore={
            "app.service": LinesToIgnoreMetadata(True)
        },
        lastLine={"val": "cpu.reset();", "shouldWrite": True},
        linesToModify={
            "step: function () {": "step: function (memory,opcodes) {\n"}
    )

    translate_opcodes = translator_generator(
        linesBefore=[],
        linesAfter=["module.exports = { opcodes };"],
        linesToIgnore={
            "app.service": LinesToIgnoreMetadata(True)
        },
        lastLine={"val": "return", "shouldWrite": False},
        linesToModify={}
    )

    translate_asm = translator_generator(
        linesBefore=["var { opcodes } = require('../emulator/opcodes')\n"],
        linesAfter=["module.exports = { asm };"],
        linesToIgnore={
            "return": LinesToIgnoreMetadata(True)
        },
        lastLine={"val": "}]);", "shouldWrite": False},
        linesToModify={
            "go: function(input) {": '"go": function(input) {',
            "app.service": "var asm = {\n",

        })

    filesToTranslate = {
        FileToTranslate("src/emulator/memory.js",
                        "node_version/src/emulator/memory.js", translate_memory),
        FileToTranslate("src/emulator/cpu.js",
                        "node_version/src/emulator/cpu.js", translate_cpu),
        FileToTranslate("src/emulator/opcodes.js",
                        "node_version/src/emulator/opcodes.js", translate_opcodes),
        FileToTranslate("src/assembler/asm.js",
                        "node_version/src/assembler/asm.js", translate_asm)
    }
    for f in filesToTranslate:
        f.transform()


if __name__ == "__main__":
    main()
