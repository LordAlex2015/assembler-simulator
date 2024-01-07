import subprocess
import sys
import json
import os

def load16(index, arr):
    return (arr[index] << 8) + arr[index + 1]


def run_test(asm_file, test_file):
    try:
        test_fd = open(test_file, "r")

        array_of_tests = json.load(test_fd)

        asm_fd = open(asm_file, "r")
        asm_str = asm_fd.read()

    except FileNotFoundError:
        print("Error: File does not appear to exist.")
        return

    for t in array_of_tests:

        code_to_execute = asm_str
        code_to_execute += '''
        HLT
        '''
        feedback_string = ''
        for key in t[0]:
            feedback_string += f'{key} : {t[0][key]}, '
            code_to_execute += f'''
            {key}: DB {t[0][key]}
            '''
        file_for_node = open("file_to_execute", "w")
        file_for_node.write(code_to_execute)
        file_for_node.close()
        try:
            os.remove("assembly_error")
        except OSError:
            pass
        try:
            os.remove("runtime_error")
        except OSError:
            pass

        rc = subprocess.call(
            "../node ../node_main.js file_to_execute", shell=True)

        if os.path.isfile("assembly_error"):
            error = open("assembly_error", "r").read()
            print(
                "- Votre code à produit l'erreur suivante lors de l'assemblage : {} \n".format(error), True)
            break
        if os.path.isfile("runtime_error"):
            error = open("runtime_error", "r").read()
            print(
                "- Votre code à produit l'erreur suivante lors de l'exécution : {} \n".format(error), True)
            continue
        data = json.loads(open("out.dat", "r").read())
        for key in t[1]:
            res = load16(data["labels"][key], data["memory"])
            if (res != t[1][key]):
                feedback_string += ' | '
                feedback_string = "Votre code ne passe pas le test suivant : " + feedback_string
                feedback_string += f' attendu : {t[1][key]}, observé : {res}'
                print(feedback_string)
            else:
                feedback_string = "Votre code passe pas le test suivant : " + feedback_string
                print(feedback_string)


def main():
    asm_file = sys.argv[1]
    test_file = sys.argv[2]
    run_test(asm_file, test_file)


if __name__ == "__main__":
    main()
