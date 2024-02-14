import subprocess
import json
import os


def load16(index, arr):
    return (arr[index] << 8) + arr[index + 1]


def run_test(asm_file, test_file):
    ret_list = []
    for t in test_file:
        code_to_execute = asm_file
        code_to_execute += '''
        HLT
        '''
        feedback_string = ''
        for key in t[0]:
            elem = t[0][key]
            feedback_string += f'{key} : {elem}, '
            if type(elem) is list:
                code_to_execute += f'''
                {key}:
                '''
                for i in range(len(elem)):
                    code_to_execute += f'''DB {elem[i]}\n'''
            else:
                code_to_execute += f'''
                {key}: DB "{t[0][key]}"
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
            f"node {os.path.dirname(os.path.abspath(__file__))}/../node_main.js file_to_execute", shell=True)

        if os.path.isfile("assembly_error"):
            error = open("assembly_error", "r").read()
            ret_list.append({"type": "assembly_error", "value": error})
            continue
        if os.path.isfile("runtime_error"):
            error = open("runtime_error", "r").read()
            ret_list.append({"type": "runtime_error", "value": error})
            continue
        data = json.loads(open("out.dat", "r").read())

        do_test_pass = True
        for key in t[1]:
            values = {}
            registers = ["A", "B", "C", "D"]
            res = None
            if key in registers:
                res = data["cpu"]["gpr"][registers.index(key)]
            elif type(t[1][key]) is str:
                res = ""
                elem = t[1][key]
                for i in range(len(elem)):
                    res += chr(load16(data["labels"][key] +
                                      (2*i), data["memory"]))

            else:
                if type(t[1][key]) is list:
                    array = []

                    for i in range(len(t[1][key])):
                        elem = t[1][key][i]
                        if type(elem) is int:
                            array.append(
                                load16(data["labels"][key]+(2*i), data["memory"]))
                        else:
                            array.append("?")
                            elem = "?"
                    res = array
                else:
                    res = load16(data["labels"][key], data["memory"])

            values[key] = res
            if (res != t[1][key]):
                do_test_pass = False

        ret_list.append(
            {"type": "success" if do_test_pass else "failure", "value": values})

    return ret_list


def default_success_feedback(test, res, printer):
    feedback = f"- Your code passed the following test : {', '.join([f'{key} : {test[0][key]}' for key in test[0]])}\n"
    printer(feedback)


def default_failure_feedback(test, res, printer):
    feedback = f"""- Your code failed the following test : {', '.join([f'{key} : {test[0][key]}' for key in test[0]])}
        expected : {', '.join([f'{key} : {test[1][key]}' for key in test[1]])}
        actual : {', '.join([f'{key} : {res["value"][key]}' for key in res["value"]])}\n"""
    printer(feedback)


def default_runtime_error_feedback(test, res, printer):
    feedback = print(f"- your code produce a runtime_error : {res['value']}\n")
    printer(feedback)


def default_assembly_error_feedback(test, res, printer):
    feedback = f"- your code produce an assembly_error : {res['value']}\n"
    printer(feedback)


def print_feedbacks(res, tests, feedbacks, printer):
    for i in range(len(res)):
        test_i = tests[i]
        res_i = res[i]
        if res[i]["type"] == "success":
            feedbacks["success"](test_i, res_i, printer)
        elif res[i]["type"] == "failure":
            feedbacks["failure"](test_i, res_i, printer)
        elif res[i]["type"] == "assembly_error":
            feedbacks["assembly_error"](test_i, res_i, printer)
        elif res[i]["type"] == "runtime_error":
            feedbacks["runtime_error"](test_i, res_i, printer)


def run_and_print_feedbacks(asm, tests, printer, feedbacks):
    res = run_test(asm, tests)
    print_feedbacks(res, tests, feedbacks, printer)
    return res


def run_and_print_feedbacks_generic(asm, tests, printer):

    feedbacks = {"success": default_success_feedback,
                 "failure": default_failure_feedback,
                 "assembly_error": default_assembly_error_feedback,
                 "run_time_error": default_runtime_error_feedback}
    res = run_and_print_feedbacks(asm, tests, printer, feedbacks)
    grade = 0
    for r in res:
        if r["type"] == "success":
            grade += 100/len(res)
    return grade
